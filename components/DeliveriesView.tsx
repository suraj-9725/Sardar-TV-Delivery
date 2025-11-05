import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Delivery } from '../types';
import { DeliveryStatus } from '../types';
import DeliveryCard from './DeliveryCard';
import DeliveryFormModal from './DeliveryFormModal';
import { Spinner } from './ui/Spinner';
import { PlusIcon, SearchIcon, CalendarIcon } from './ui/Icons';
import { useAuthContext } from '../App';

export default function DeliveriesView() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'All'>('All');
  const [dateFilter, setDateFilter] = useState('');
  
  const { user } = useAuthContext();
  const isAdmin = user?.email === 'admin@admin.com';

  useEffect(() => {
    const q = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const deliveriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Delivery));
      setDeliveries(deliveriesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deliveries:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        (delivery.invoiceNumber && delivery.invoiceNumber.toLowerCase().includes(lowercasedSearchTerm)) ||
        delivery.productName.toLowerCase().includes(lowercasedSearchTerm) ||
        delivery.customerName.toLowerCase().includes(lowercasedSearchTerm) ||
        delivery.address.toLowerCase().includes(lowercasedSearchTerm);
      
      const matchesStatus = statusFilter === 'All' || delivery.status === statusFilter;
      
      const matchesDate = dateFilter === '' || 
        new Date(delivery.createdAt.toDate()).toISOString().split('T')[0] === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [deliveries, searchTerm, statusFilter, dateFilter]);

  const handleAddDelivery = async (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy' | 'createdByUid'>) => {
    if (!user?.email || !user.uid) return;
    try {
      await addDoc(collection(db, "deliveries"), {
        ...deliveryData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastUpdatedBy: user.email,
        createdByUid: user.uid,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding delivery: ", error);
    }
  };

  const handleUpdateDelivery = async (id: string, data: Partial<Delivery>) => {
    if (!user?.email) return;
    
    const payload: { [key: string]: any } = {
      ...data,
      updatedAt: Timestamp.now(),
      lastUpdatedBy: user.email,
    };

    if (data.status === DeliveryStatus.DELIVERED) {
      payload.deliveredAt = Timestamp.now();
      payload.deliveredBy = user.email;
    }
    
    try {
      await updateDoc(doc(db, "deliveries", id), payload);
    } catch (error) {
      console.error("Error updating delivery: ", error);
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    try {
      await deleteDoc(doc(db, "deliveries", id));
    } catch (error) {
      console.error("Error deleting delivery: ", error);
    }
  };
  
  const filterButtons = [...Object.values(DeliveryStatus).filter(s => s !== DeliveryStatus.NEW), 'All'];

  return (
    <div className="space-y-6 pb-24">
       <h1 className="text-3xl font-bold text-brand-text pt-3">Delivery Tracker</h1>
       
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-brand-text-light" />
                </span>
                <input
                type="text"
                placeholder="Search by invoice, product, customer, or address..."
                className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative">
                 <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                 <CalendarIcon className="h-5 w-5 text-brand-text-dark"/>
                </span>
                <input
                    type="date"
                    placeholder="Enter date of delivery"
                    className="w-full px-4 py-2 bg-brand-surface border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>
        </div>
        <div className="flex flex-col items-start gap-2">
          <span className="text-sm font-bold text-brand-text-light">Filter by status:</span>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as DeliveryStatus | 'All')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-brand-primary text-white'
                    : 'text-brand-text-light hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner /></div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeliveries.map(delivery => (
                <DeliveryCard 
                    key={delivery.id} 
                    delivery={delivery}
                    onUpdate={handleUpdateDelivery}
                    onDelete={handleDeleteDelivery}
                    isAdmin={isAdmin}
                />
                ))}
            </div>
            
            {filteredDeliveries.length === 0 && (
                <div className="text-center py-16 col-span-full bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-brand-text">No Deliveries Found</h3>
                    <p className="text-brand-text-light mt-1">Try adjusting your search or filters.</p>
                </div>
            )}
        </>
      )}


      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-brand-primary hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {isModalOpen && (
        <DeliveryFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddDelivery}
        />
      )}
    </div>
  );
}
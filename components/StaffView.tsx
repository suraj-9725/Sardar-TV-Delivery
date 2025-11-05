
import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Staff } from '../types';
import { useAuthContext } from '../App';
import StaffCard from './StaffCard';
import StaffFormModal from './StaffFormModal';
import { Spinner } from './ui/Spinner';
import { PlusIcon, SearchIcon } from './ui/Icons';

export default function StaffView() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthContext();
  const isAdmin = user?.email === 'admin@admin.com';

  useEffect(() => {
    const q = query(collection(db, 'staff'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const staffData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Staff));
      setStaff(staffData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching staff:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  const handleAddStaff = async (staffData: Omit<Staff, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'staff'), {
        ...staffData,
        createdAt: Timestamp.now(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding staff member:", error);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (error) {
      console.error("Error deleting staff member:", error);
    }
  };

  return (
    <div className="relative pb-24">
      <h1 className="text-3xl font-bold text-brand-text pt-3 pb-6">Staff Management</h1>
      
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-brand-text-light" />
        </span>
        <input
            type="text"
            placeholder="Search by name or role..."
            className="w-full max-w-sm pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner /></div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStaff.map(member => (
                <StaffCard 
                    key={member.id} 
                    staffMember={member}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteStaff}
                />
                ))}
            </div>
            
            {filteredStaff.length === 0 && (
                <div className="text-center py-16 col-span-full bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-brand-text">No Staff Members Found</h3>
                    <p className="text-brand-text-light mt-1">
                      {searchTerm 
                        ? 'Try adjusting your search.' 
                        : "Click the '+' button to add a new staff member."}
                    </p>
                </div>
            )}
        </>
      )}

      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-brand-primary hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      )}

      {isModalOpen && (
        <StaffFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddStaff}
        />
      )}
    </div>
  );
}

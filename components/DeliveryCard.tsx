
import React, { useState } from 'react';
import type { Delivery } from '../types';
import { DeliveryStatus } from '../types';
import { Timestamp } from 'firebase/firestore';
import { 
    PencilIcon, 
    TrashIcon, 
    CameraIcon, 
    ClockIcon, 
    TruckIcon, 
    CheckCircleIcon, 
    MapPinIcon,
    SparklesIcon,
    ChevronDownIcon,
    BuildingStorefrontIcon
} from './ui/Icons';
import ConfirmationModal from './ui/ConfirmationModal';
import ImageModal from './ui/ImageModal';
import DeliveryFormModal from './DeliveryFormModal';

interface DeliveryCardProps {
  delivery: Delivery;
  onUpdate: (id: string, data: Partial<Delivery>) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<DeliveryStatus, { bg: string, text: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }> = {
    [DeliveryStatus.NEW]: { bg: 'bg-status-new', text: 'text-white', icon: SparklesIcon },
    [DeliveryStatus.PENDING]: { bg: 'bg-status-pending', text: 'text-white', icon: ClockIcon },
    [DeliveryStatus.ON_DELIVERY]: { bg: 'bg-status-on-delivery', text: 'text-white', icon: TruckIcon },
    [DeliveryStatus.DELIVERED]: { bg: 'bg-status-delivered', text: 'text-white', icon: CheckCircleIcon },
};

const formatDateTime = (timestamp: Timestamp | undefined) => {
    if (!timestamp?.toDate) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleString([], { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const StatusSelector = ({ status, onUpdate }: { status: DeliveryStatus, onUpdate: (newStatus: DeliveryStatus) => void }) => {
    const [isConfirming, setConfirming] = useState<DeliveryStatus | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as DeliveryStatus;
        if (newStatus !== status) {
            setConfirming(newStatus);
        }
    };
    
    const confirmChange = () => {
        if (isConfirming) {
            onUpdate(isConfirming);
            setConfirming(null);
        }
    };

    if (status === DeliveryStatus.DELIVERED) {
        return <span className="text-sm font-medium text-brand-text">Status: Delivered</span>;
    }

    return (
        <>
            <div className="relative">
                <select
                    value={status}
                    onChange={handleChange}
                    className="appearance-none bg-white border border-brand-border rounded-md pl-3 pr-8 py-2 text-sm font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    {Object.values(DeliveryStatus).map(s => {
                        if (s === DeliveryStatus.NEW && status !== DeliveryStatus.NEW) {
                            return null;
                        }
                        return <option key={s} value={s}>{s}</option>;
                    })}
                </select>
                <ChevronDownIcon className="h-5 w-5 text-brand-text-light absolute top-1/2 right-2 -translate-y-1/2 pointer-events-none" />
            </div>
            {isConfirming && (
                <ConfirmationModal 
                    isOpen={!!isConfirming}
                    onClose={() => setConfirming(null)}
                    onConfirm={confirmChange}
                    title="Confirm Status Change"
                    message={`Are you sure you want to change status to "${isConfirming}"?`}
                />
            )}
        </>
    );
};


export default function DeliveryCard({ delivery, onUpdate, onDelete }: DeliveryCardProps) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);

  const currentStatusConfig = statusConfig[delivery.status];
  const StatusIcon = currentStatusConfig.icon;

  const handleUpdate = (updatedData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy'>) => {
    onUpdate(delivery.id, updatedData);
    setEditModalOpen(false);
  };

  return (
    <div className="bg-brand-surface rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow hover:shadow-lg">
      {/* Card Header */}
      <div className={`${currentStatusConfig.bg} ${currentStatusConfig.text} p-4 flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="h-6 w-6" />
          <h2 className="text-lg font-bold">{delivery.status}</h2>
        </div>
        {delivery.status !== DeliveryStatus.DELIVERED && (
          <div className="flex items-center space-x-2">
            <button 
                onClick={() => setEditModalOpen(true)} 
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Edit Delivery"
            >
                <PencilIcon className="h-4 w-4" />
            </button>
            <button 
                onClick={() => setDeleteModalOpen(true)} 
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Delete Delivery"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-grow space-y-4">
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-24 h-24 bg-slate-100 rounded-md flex items-center justify-center">
                 {delivery.productImage ? (
                    <img 
                        src={delivery.productImage} 
                        onClick={() => setImageModalOpen(true)} 
                        className="h-full w-full object-contain rounded-md cursor-pointer" 
                        alt={delivery.productName} 
                    />
                ) : (
                    <CameraIcon className="h-8 w-8 text-slate-400" />
                )}
            </div>
            <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-brand-text" title={delivery.productName}>{delivery.productName}</h3>
                <p className="text-sm text-brand-text font-medium">{delivery.customerName}</p>
                <div className="flex items-start gap-2 text-sm text-brand-text-light">
                    <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{delivery.address}</span>
                </div>
            </div>
        </div>
        
        {delivery.notes && (
            <div className="text-sm text-brand-text-light bg-slate-50 p-3 rounded-md border border-slate-200">
                <strong className="text-brand-text">Notes:</strong> {delivery.notes}
            </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="bg-slate-50 px-5 py-3 border-t border-brand-border flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-brand-text-light space-y-1">
            <div className="flex items-center gap-2">
                <BuildingStorefrontIcon className="h-5 w-5 text-brand-primary" />
                <span className="font-semibold text-sm text-brand-text bg-blue-100 px-2.5 py-1 rounded-full">{delivery.branch}</span>
            </div>
            <div className="pl-1 pt-1">
                <p><span className="font-semibold">Created:</span> {formatDateTime(delivery.createdAt)}</p>
                {delivery.status === DeliveryStatus.DELIVERED && delivery.deliveredAt && (
                    <p><span className="font-semibold text-green-600">Delivered:</span> {formatDateTime(delivery.updatedAt)}</p>
                )}
            </div>
        </div>
        <div className="flex-shrink-0">
            <StatusSelector status={delivery.status} onUpdate={(newStatus) => onUpdate(delivery.id, { status: newStatus })} />
        </div>
      </div>


      {/* Modals */}
      {isEditModalOpen && (
        <DeliveryFormModal
            isOpen={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSubmit={handleUpdate}
            initialData={delivery}
        />
      )}
      
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => { onDelete(delivery.id); setDeleteModalOpen(false); }}
          title="Delete Delivery"
          message="Are you sure you want to delete this delivery? This action cannot be undone."
          confirmButtonText="Delete"
          isDestructive={true}
        />
      )}

      {isImageModalOpen && delivery.productImage && (
        <ImageModal
            isOpen={isImageModalOpen}
            onClose={() => setImageModalOpen(false)}
            imageUrl={delivery.productImage}
            altText={delivery.productName}
        />
      )}
    </div>
  );
}


import React, { useState } from 'react';
import type { Staff } from '../types';
import { TrashIcon, PhoneIcon, UserIcon } from './ui/Icons';
import ConfirmationModal from './ui/ConfirmationModal';

interface StaffCardProps {
  staffMember: Staff;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function StaffCard({ staffMember, isAdmin, onDelete }: StaffCardProps) {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <div className="bg-brand-surface rounded-lg shadow-md p-6 flex flex-col text-left relative transition-shadow hover:shadow-lg group">
      <div className="flex-grow">
        <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-brand-primary-light flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-brand-primary" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-brand-text">{staffMember.name}</h3>
                <p className="text-brand-primary font-medium">{staffMember.role}</p>
            </div>
        </div>
      </div>
      
      <div className="mt-1 flex items-center justify-between">
        <p className="text-brand-text-light">{staffMember.phone}</p>
        <a 
            href={`tel:${staffMember.phone}`}
            className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
            <PhoneIcon className="w-6 h-5 mr-1.5" />
            Call
        </a>
      </div>
      
      {isAdmin && (
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="absolute top-2 right-2 p-2 text-brand-text-light rounded-full hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => { onDelete(staffMember.id); setDeleteModalOpen(false); }}
          title="Delete Staff Member"
          message={`Are you sure you want to delete ${staffMember.name}? This action cannot be undone.`}
          confirmButtonText="Delete"
          isDestructive={true}
        />
      )}
    </div>
  );
}

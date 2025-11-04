
import React, { useState } from 'react';
import type { Staff } from '../types';
import Modal from './ui/Modal';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Staff, 'id' | 'createdAt'>) => void;
}

export default function StaffFormModal({ isOpen, onClose, onSubmit }: StaffFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const inputClass = "mt-1 block w-full rounded-md border-brand-border shadow-sm focus:border-brand-primary focus:ring-brand-primary";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Staff Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand-text">Full Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-brand-text">Role</label>
          <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-brand-text">Phone Number</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className={inputClass} />
        </div>
        <div className="pt-5">
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-brand-border rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400">
              {loading ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

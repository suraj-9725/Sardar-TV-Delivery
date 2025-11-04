import React, { useState, useRef } from 'react';
import type { Delivery } from '../types';
import { DeliveryStatus, Branch } from '../types';
import Modal from './ui/Modal';
import { ImageIcon } from './ui/Icons';

interface DeliveryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy'>) => void;
  initialData?: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy'> & { id?: string };
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function DeliveryFormModal({ isOpen, onClose, onSubmit, initialData }: DeliveryFormModalProps) {
  const [formData, setFormData] = useState({
    productName: initialData?.productName || '',
    customerName: initialData?.customerName || '',
    address: initialData?.address || '',
    status: initialData?.status || DeliveryStatus.PENDING,
    branch: initialData?.branch || Branch.NIKOL,
    notes: initialData?.notes || '',
    productImage: initialData?.productImage || '',
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const base64Image = await fileToBase64(file);
        setFormData(prev => ({ ...prev, productImage: base64Image }));
        setLoading(false);
      } catch (error) {
        console.error("Error converting file to base64", error);
        alert("Failed to upload image.");
        setLoading(false);
      }
    }
  };

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const inputClass = "block w-full rounded-lg bg-slate-100 border-transparent focus:border-brand-primary focus:ring-1 focus:ring-brand-primary px-4 py-3 placeholder-brand-text-light";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Delivery" : "Add New Delivery"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="productName" placeholder="Product Name" value={formData.productName} onChange={handleChange} required className={inputClass} />
        
        <input type="text" name="customerName" placeholder="Customer Name" value={formData.customerName} onChange={handleChange} required className={inputClass} />
        
        <textarea name="address" placeholder="Delivery Address" value={formData.address} onChange={handleChange} required rows={2} className={inputClass} />
        
        <div>
          <label className="block text-sm font-medium text-brand-text mb-2">Delivery Branch</label>
          <div className="flex items-center space-x-8 bg-slate-100 p-4 rounded-lg">
            <label htmlFor="nikol-branch" className="flex items-center cursor-pointer">
              <input type="radio" id="nikol-branch" name="branch" value={Branch.NIKOL} checked={formData.branch === Branch.NIKOL} onChange={handleChange} className="h-4 w-4 text-brand-primary border-gray-300 focus:ring-brand-primary" />
              <span className="ml-3 text-brand-text">{Branch.NIKOL}</span>
            </label>
            <label htmlFor="spc-branch" className="flex items-center cursor-pointer">
              <input type="radio" id="spc-branch" name="branch" value={Branch.SARDAR_PATEL_CHOWK} checked={formData.branch === Branch.SARDAR_PATEL_CHOWK} onChange={handleChange} className="h-4 w-4 text-brand-primary border-gray-300 focus:ring-brand-primary" />
              <span className="ml-3 text-brand-text">{Branch.SARDAR_PATEL_CHOWK}</span>
            </label>
          </div>
        </div>
        
        <textarea name="notes" placeholder="Optional Notes (e.g., call upon arrival)" value={formData.notes} onChange={handleChange} rows={2} className={inputClass} />

        <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
        />
        
        {formData.productImage && (
          <div className="text-center bg-slate-100 p-2 rounded-lg relative group">
            <img src={formData.productImage} alt="Product preview" className="mx-auto h-24 w-auto object-contain rounded-md" />
            <button type="button" onClick={() => setFormData(prev => ({...prev, productImage: ''}))} className="absolute top-2 right-2 bg-white/70 backdrop-blur-sm rounded-full p-1 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-white transition-opacity opacity-0 group-hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="pt-4 grid grid-cols-2 gap-4">
          <button type="submit" disabled={loading} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-300 disabled:text-slate-500">
            {loading ? (initialData?.id ? 'Saving...' : 'Adding...') : (initialData?.id ? 'Save Changes' : 'Add Delivery')}
          </button>
          <button type="button" onClick={handleAddImageClick} className="w-full inline-flex items-center justify-center py-3 px-4 border border-brand-border shadow-sm text-sm font-medium rounded-lg text-brand-text bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
            <ImageIcon className="h-5 w-5 -ml-1 mr-2" />
            Add Image
          </button>
        </div>
      </form>
    </Modal>
  );
}
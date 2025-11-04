
import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
}

export enum DeliveryStatus {
  NEW = 'New',
  PENDING = 'Pending',
  ON_DELIVERY = 'On Delivery',
  DELIVERED = 'Delivered',
}

export enum Branch {
  SARDAR_PATEL_CHOWK = 'Sardar Patel Chowk',
  NIKOL = 'Nikol',
}

export interface Delivery {
  id: string;
  productName: string;
  customerName: string;
  address: string;
  status: DeliveryStatus;
  createdAt: Timestamp;
  branch: Branch;
  notes?: string;
  productImage?: string; // Base64 string
  lastUpdatedBy: string;
  updatedAt: Timestamp;
  deliveredAt?: Timestamp;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  createdAt: Timestamp;
}
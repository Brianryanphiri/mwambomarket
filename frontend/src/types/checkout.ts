// src/types/checkout.ts
export interface CustomerInfo {
  fullName: string;
  phoneNumber: string;
  email?: string;
  isGuest: boolean;
}

export interface DeliveryAddress {
  city: string;
  area: string;
  streetDescription: string;
  landmark?: string;
  deliveryInstructions?: string;
}

export interface DeliveryOption {
  id: 'same-day' | 'next-day' | 'scheduled' | 'express';
  name: string;
  price: number;
  estimatedTime: string;
  description: string;
}

export type PaymentMethod = 'airtel-money' | 'tnm-mpamba' | 'bank-transfer' | 'cash-on-delivery';

export interface PaymentDetails {
  method: PaymentMethod;
  phoneNumber?: string; // For mobile money
  transactionId?: string; // After payment
  proofOfPayment?: string; // Screenshot URL for bank transfer
  status: 'pending' | 'verified' | 'failed';
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  deliveryOption: DeliveryOption;
  payment: PaymentDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'payment-verification' 
  | 'processing' 
  | 'preparing' 
  | 'out-for-delivery' 
  | 'delivered' 
  | 'cancelled';

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'same-day',
    name: 'Same Day Delivery',
    price: 2500,
    estimatedTime: 'Today before 6PM',
    description: 'Order before 2PM for same-day delivery'
  },
  {
    id: 'next-day',
    name: 'Next Day Delivery',
    price: 1500,
    estimatedTime: 'Tomorrow between 9AM-6PM',
    description: 'Choose your preferred time slot'
  },
  {
    id: 'scheduled',
    name: 'Scheduled Delivery',
    price: 1000,
    estimatedTime: 'Pick your date',
    description: 'Schedule for a future date'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    price: 5000,
    estimatedTime: 'Within 2 hours',
    description: 'Priority handling and fast delivery'
  }
];
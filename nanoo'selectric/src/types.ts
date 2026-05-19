export type ProductStatus = 'draft' | 'published' | 'archived';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
export type UserRole = 'admin' | 'manager' | 'staff' | 'user';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  image: string; // Legacy support for single image
  color?: string; // Added color
  ingredients?: string[]; // Added ingredients
  category: string;
  subcategory?: string;
  status?: ProductStatus;
  sku?: string;
  inventory?: number;
  variants?: ProductVariant[];
  nutrition?: {
    calories: number;
    caffeine: number;
    sugar: number;
    sodium: number;
    protein?: number;
  };
  benefits?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inventory: number;
  sku: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: any;
  lastLogin?: any;
  totalSpent?: number;
  orderCount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  expiryDate?: any;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
}

export interface Settings {
  storeName: string;
  storeEmail: string;
  currency: string;
  taxRate: number;
  shippingZones: any[];
  paymentMethods: any[];
  notifications: {
    orderConfirmation: boolean;
    shippingUpdate: boolean;
    newPromotion: boolean;
  };
}

export interface StoreSettings {
  storeName: string;
  logo?: string;
  currency: string;
  taxRate: number;
  shippingZones: ShippingZone[];
  contactEmail: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  minWeight?: number;
  maxWeight?: number;
  minOrder?: number;
}

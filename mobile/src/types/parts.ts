import type { ServiceProvider } from './provider';

export type PartCategory =
  | 'battery'
  | 'body'
  | 'brakes'
  | 'engine'
  | 'filters'
  | 'fluids'
  | 'tyres';

export type VehicleCompatibility = {
  make: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
};

export type PartProduct = {
  category: PartCategory;
  compatibility: readonly VehicleCompatibility[];
  id: string;
  inStock: boolean;
  name: string;
  priceXaf: number;
  sku: string;
  vendorId: string;
};

export type PartsVendor = ServiceProvider & {
  categories: readonly PartCategory[];
};

export type PartsOrderStatus =
  | 'canceled'
  | 'confirmed'
  | 'delivered'
  | 'out_for_delivery'
  | 'payment_pending'
  | 'processing';

export type PartsOrderItem = {
  productId: string;
  quantity: number;
  unitPriceXaf: number;
};

export type PartsOrder = {
  createdAt: string;
  id: string;
  items: readonly PartsOrderItem[];
  status: PartsOrderStatus;
  totalXaf: number;
  userVehicleId?: string;
  vendorId: string;
};


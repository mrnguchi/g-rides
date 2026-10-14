import type { Vehicle } from './map';
import type { VehicleDocument } from './vehicle';

export type FleetStatus = 'Available' | 'Rented' | 'Maintenance' | 'Pending verification';
export type FleetItem = {
  id: string; name: string; year?: string; image?: Vehicle['image']; dailyRate?: number;
  transmission: string; category: string; seats?: number; rating?: number; status: FleetStatus;
  bookings: number; earnings: number; registration?: string;
  description?: string; fuelType?: string; airConditioning?: boolean;
  documents?: readonly VehicleDocument[];
  ownerPhotos?: Vehicle['ownerPhotos'];
};
export type FleetEdits = Pick<FleetItem, 'dailyRate' | 'description' | 'transmission' | 'seats' | 'fuelType' | 'airConditioning' | 'status'>;

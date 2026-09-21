import type { Vehicle } from './map';

export type RentalStatus = 'active' | 'canceled' | 'completed' | 'confirmed';

export type RentalRecord = {
  bookingReference: string;
  depositXaf: number;
  driver: string;
  durationLabel: string;
  endDate: string;
  endTime: string;
  id: string;
  insured: string;
  pickupDate: string;
  pickupLocation: string;
  pickupTime: string;
  pickupType: string;
  startDate: string;
  startTime: string;
  status: RentalStatus;
  totalPaidXaf: number;
  vehicle: Vehicle;
};

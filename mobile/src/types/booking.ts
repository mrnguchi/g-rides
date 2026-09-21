import type { Vehicle } from './map';

export type BookingDrivingOption = 'chauffeur' | 'selfDrive';
export type BookingFulfillment = 'delivery' | 'pickup';

export type BookingRequest = {
  bookingReference: string;
  chauffeurFeeXaf: number;
  createdAt: string;
  depositXaf: number;
  drivingOption: BookingDrivingOption;
  durationDays: number;
  endDate: string;
  fulfillment: BookingFulfillment;
  fulfillmentFeeXaf: number;
  id: string;
  message?: string;
  pickupTime: string;
  rentalAmountXaf: number;
  startDate: string;
  status: 'pending';
  totalDueAfterApprovalXaf: number;
  vehicle: Vehicle;
};

import { MOCK_HOME_VEHICLES } from './mockVehicles';

export type OwnerBookingStatus = 'Requested' | 'Confirmed' | 'In progress' | 'Completed' | 'Cancelled' | 'Declined';
export type OwnerBooking = {
  id: string; vehicle: typeof MOCK_HOME_VEHICLES[number]; renter: string; conversationId: string;
  pickup: string; returnAt: string; days: number; status: OwnerBookingStatus;
  pickupType: string; location: string; payment: string;
};
// UI fixtures; dates and payment states are not connected to live bookings.
export const MOCK_OWNER_BOOKINGS: OwnerBooking[] = [
  { id: 'GR1025', vehicle: MOCK_HOME_VEHICLES[1], renter: 'Alex M.', conversationId: 'owner-chat-renter-alex', pickup: '2026-10-10T09:00:00', returnAt: '2026-10-12T09:00:00', days: 2, status: 'Requested', pickupType: 'Owner pickup', location: 'Bonapriso, Douala', payment: 'Awaiting confirmation' },
  { id: 'GR1024', vehicle: MOCK_HOME_VEHICLES[2], renter: 'Chris T.', conversationId: 'owner-chat-renter-chris', pickup: '2026-10-07T10:00:00', returnAt: '2026-10-10T10:00:00', days: 3, status: 'Confirmed', pickupType: 'Owner pickup', location: 'Bonapriso, Douala', payment: 'Paid' },
  { id: 'GR1023', vehicle: MOCK_HOME_VEHICLES[3], renter: 'Danielle N.', conversationId: 'owner-chat-renter-danielle', pickup: '2026-10-01T10:00:00', returnAt: '2026-10-05T10:00:00', days: 4, status: 'In progress', pickupType: 'Owner pickup', location: 'Bonapriso, Douala', payment: 'Paid' },
  { id: 'GR1022', vehicle: MOCK_HOME_VEHICLES[0], renter: 'Jordan K.', conversationId: 'owner-chat-renter-jordan', pickup: '2026-09-26T10:00:00', returnAt: '2026-09-29T10:00:00', days: 3, status: 'Completed', pickupType: 'Owner pickup', location: 'Bonapriso, Douala', payment: 'Paid' },
  { id: 'GR1021', vehicle: MOCK_HOME_VEHICLES[1], renter: 'Alex M.', conversationId: 'owner-chat-renter-alex', pickup: '2026-09-20T09:00:00', returnAt: '2026-09-22T09:00:00', days: 2, status: 'Cancelled', pickupType: 'Owner pickup', location: 'Bonapriso, Douala', payment: 'No payment collected' },
];

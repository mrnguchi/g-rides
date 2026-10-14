import type { ChatConversation } from '../types/chat';
import { MOCK_HOME_VEHICLES } from './mockVehicles';
import { MOCK_OWNER_BOOKINGS } from './mockOwnerBookings';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

export const MOCK_OWNER_CONVERSATIONS: ChatConversation[] = [
  ...MOCK_OWNER_BOOKINGS.filter(booking => booking.renter !== 'Alex M.').map(booking => ({
    id: booking.conversationId, bookingLabel: `Booking #${booking.id}`, unreadCount: 0,
    vehicle: booking.vehicle,
    participant: { id: booking.conversationId, name: booking.renter, role: 'Renter' as const, isOnline: false, avatar: require('../../assets/images/10007.png') },
    messages: [],
  })),
  {
    id: 'owner-chat-renter-alex', bookingLabel: 'Booking request', unreadCount: 2, isPinned: true,
    vehicle: MOCK_HOME_VEHICLES[1],
    participant: { id: 'renter-alex', name: 'Alex M.', role: 'Renter', isOnline: true, avatar: require('../../assets/images/10007.png') },
    messages: [
      { id: 'alex-1', sender: 'other', sentAt: minutesAgo(45), text: 'Hello, I would like to rent your Yaris for the weekend.' },
      { id: 'alex-2', sender: 'me', sentAt: minutesAgo(40), text: 'Hello Alex. Please send your preferred dates in a booking request.', status: 'read' },
      { id: 'alex-3', sender: 'other', sentAt: minutesAgo(12), text: 'I have sent the request. Can we arrange pickup at 9 AM?' },
      { id: 'alex-4', sender: 'other', sentAt: minutesAgo(8), text: 'I can meet you at the pickup location.' },
    ],
  },
  {
    id: 'owner-chat-driver-kevin', bookingLabel: 'Assigned vehicle', unreadCount: 1,
    vehicle: MOCK_HOME_VEHICLES[3],
    participant: { id: 'driver-kevin', name: 'Kevin M.', role: 'Driver', isOnline: false, avatar: require('../../assets/images/role-3.png') },
    messages: [
      { id: 'owner-kevin-1', sender: 'me', sentAt: minutesAgo(80), text: 'Please check the vehicle before the next pickup.', status: 'read' },
      { id: 'owner-kevin-2', sender: 'other', sentAt: minutesAgo(25), text: 'The vehicle check is done. I am ready for the next pickup.' },
    ],
  },
  {
    id: 'owner-chat-support', unreadCount: 0,
    participant: { id: 'owner-support', name: 'G-Rides Support', role: 'Official support', isOnline: true, isSupport: true, avatar: require('../../assets/images/logo-blue.png') },
    messages: [{ id: 'owner-support-1', sender: 'other', sentAt: minutesAgo(150), text: 'Hello! We can help with your listings, bookings and owner account.' }],
  },
];

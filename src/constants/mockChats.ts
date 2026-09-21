import type { ChatConversation } from '../types/chat';
import { MOCK_NEARBY_VEHICLES } from './mockVehicles';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'chat-owner-munoh',
    bookingLabel: 'Confirmed rental',
    isPinned: true,
    participant: {
      id: 'owner-munoh',
      name: 'Munoh N.',
      role: 'Car owner',
      isOnline: true,
      avatar: require('../../assets/images/10007.png'),
    },
    unreadCount: 2,
    vehicle: MOCK_NEARBY_VEHICLES[1],
    messages: [
      {
        id: 'munoh-1',
        sender: 'other',
        sentAt: minutesAgo(74),
        text: 'Hello! I have reviewed your rental request.',
      },
      {
        id: 'munoh-2',
        sender: 'me',
        sentAt: minutesAgo(67),
        status: 'read',
        text: 'Great, thank you. Is the car available for pickup at 9 AM?',
      },
      {
        id: 'munoh-3',
        sender: 'other',
        sentAt: minutesAgo(12),
        text: 'Yes, your request is confirmed. I will send the pickup instructions shortly.',
      },
      {
        id: 'munoh-4',
        sender: 'other',
        sentAt: minutesAgo(8),
        text: 'Please complete payment in the app to secure the booking.',
      },
    ],
  },
  {
    id: 'chat-g-rides-support',
    participant: {
      id: 'g-rides-support',
      name: 'G-Rides Support',
      role: 'Official support',
      isOnline: true,
      isSupport: true,
      avatar: require('../../assets/images/logo-blue.png'),
    },
    unreadCount: 0,
    messages: [
      {
        id: 'support-1',
        sender: 'other',
        sentAt: minutesAgo(1440),
        text: 'Welcome to G-Rides support. How can we help with your rental?',
      },
      {
        id: 'support-2',
        sender: 'me',
        sentAt: minutesAgo(1390),
        status: 'read',
        text: 'Thanks. Everything is sorted for now.',
      },
      {
        id: 'support-3',
        sender: 'other',
        sentAt: minutesAgo(1385),
        text: 'Perfect. We are here whenever you need us.',
      },
    ],
  },
  {
    id: 'chat-driver-kevin',
    bookingLabel: 'Active rental',
    participant: {
      id: 'driver-kevin',
      name: 'Kevin M.',
      role: 'Your driver',
      isOnline: false,
      avatar: require('../../assets/images/role-3.png'),
    },
    unreadCount: 0,
    vehicle: MOCK_NEARBY_VEHICLES[0],
    messages: [
      {
        id: 'kevin-1',
        sender: 'other',
        sentAt: minutesAgo(3020),
        text: 'I have arrived at the pickup point.',
      },
      {
        id: 'kevin-2',
        sender: 'me',
        sentAt: minutesAgo(3017),
        status: 'read',
        text: 'I can see you. Coming out now.',
      },
    ],
  },
];

import type { AppNotification } from '../types/notification';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    actionLabel: 'View rental',
    destination: 'activity',
    id: 'notification-booking-accepted',
    kind: 'booking',
    message:
      'Your Range Rover Sport request was accepted. Complete payment to secure the car.',
    read: false,
    timeLabel: '2 min ago',
    title: 'Booking request accepted',
  },
  {
    actionLabel: 'Open messages',
    destination: 'messages',
    id: 'notification-owner-message',
    kind: 'message',
    message: 'Munoh N. sent you a message about your upcoming rental.',
    read: false,
    timeLabel: '18 min ago',
    title: 'New message from the owner',
  },
  {
    actionLabel: 'Discover cars',
    destination: 'discover',
    id: 'notification-nearby-cars',
    kind: 'discovery',
    message: 'New verified SUVs are now available near your current location.',
    read: true,
    timeLabel: 'Yesterday',
    title: 'More cars nearby',
  },
  {
    id: 'notification-security-reminder',
    kind: 'security',
    message:
      'Keep payments inside G-Rides so your booking and security deposit stay protected.',
    read: true,
    timeLabel: '2 days ago',
    title: 'A quick safety reminder',
  },
];

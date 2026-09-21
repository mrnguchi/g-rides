import type { ImageSourcePropType } from 'react-native';

import type { Vehicle } from './map';

export type MessageDeliveryStatus = 'delivered' | 'read' | 'sent';

export type ChatMessage = {
  id: string;
  sender: 'me' | 'other';
  sentAt: string;
  status?: MessageDeliveryStatus;
  text: string;
};

export type ChatParticipant = {
  avatar: ImageSourcePropType;
  id: string;
  isOnline: boolean;
  isSupport?: boolean;
  name: string;
  role: string;
};

export type ChatConversation = {
  bookingLabel?: string;
  id: string;
  isPinned?: boolean;
  messages: ChatMessage[];
  participant: ChatParticipant;
  unreadCount: number;
  vehicle?: Vehicle;
};

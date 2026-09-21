import type { MainTab } from './navigation';

export type NotificationDestination = Extract<
  MainTab,
  'activity' | 'discover' | 'messages'
>;
export type NotificationKind = 'booking' | 'discovery' | 'message' | 'security';

export type AppNotification = {
  actionLabel?: string;
  destination?: NotificationDestination;
  id: string;
  kind: NotificationKind;
  message: string;
  read: boolean;
  timeLabel: string;
  title: string;
};

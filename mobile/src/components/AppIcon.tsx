import {
  ArrowRight,
  ArrowUpRight,
  BellNotification,
  BellNotificationSolid,
  CalendarCheck,
  ChatBubble,
  ChatBubbleQuestion,
  ChatBubbleSolid,
  CreditCard,
  EditPencil,
  Garage,
  GraphUp,
  HeadsetHelp,
  HelpCircle,
  HelpCircleSolid,
  HomeSimple,
  InfoCircle,
  InfoCircleSolid,
  Language,
  LogOut,
  NavArrowRight,
  Page,
  Plus,
  RefreshDouble,
  Search,
  Settings,
  ShieldCheck,
  UserStar,
  ViewGrid,
  Xmark,
} from 'iconoir-react-native';
import type { ComponentType } from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Import the icon directly: the package index references missing icon files.
import ProfileCircle from 'iconsax-react-native/dist/cjs/ProfileCircle';

import { colors } from '../theme';

export type AppIconName =
  | 'activity'
  | 'arrowForward'
  | 'arrowUpRight'
  | 'bookings'
  | 'chevronRight'
  | 'close'
  | 'creditCard'
  | 'discover'
  | 'documents'
  | 'edit'
  | 'favorite'
  | 'help'
  | 'home'
  | 'info'
  | 'language'
  | 'license'
  | 'location'
  | 'logout'
  | 'messages'
  | 'notification'
  | 'plus'
  | 'privacy'
  | 'profile'
  | 'driver'
  | 'fleet'
  | 'trendUp'
  | 'security'
  | 'settings'
  | 'support'
  | 'swap'
  | 'vehicle'
  | 'verified'
  | 'wallet';

type AppIconProps = {
  color?: string;
  name: AppIconName;
  size?: number;
  solid?: boolean;
  strokeWidth?: number;
};

type IconComponent = ComponentType<SvgProps>;

const icons: Record<Exclude<AppIconName, 'vehicle' | 'profile' | 'license' | 'verified' | 'location' | 'security' | 'wallet' | 'favorite' | 'privacy'>, IconComponent> = {
  activity: ViewGrid,
  arrowForward: ArrowRight,
  arrowUpRight: ArrowUpRight,
  bookings: CalendarCheck,
  chevronRight: NavArrowRight,
  close: Xmark,
  creditCard: CreditCard,
  discover: Search,
  documents: Page,
  edit: EditPencil,
  driver: UserStar,
  fleet: Garage,
  trendUp: GraphUp,
  help: HelpCircle,
  home: HomeSimple,
  info: InfoCircle,
  language: Language,
  logout: LogOut,
  messages: ChatBubble,
  notification: BellNotification,
  plus: Plus,
  settings: Settings,
  support: HeadsetHelp,
  swap: RefreshDouble,
};

const solidIcons: Partial<Record<AppIconName, IconComponent>> = {
  help: HelpCircleSolid,
  info: InfoCircleSolid,
  messages: ChatBubbleSolid,
  notification: BellNotificationSolid,
};

export function AppIcon({
  color = colors.textPrimary,
  name,
  size = 22,
  solid = false,
  strokeWidth = 1.7,
}: AppIconProps) {
  if (name === 'wallet') {
    return <Ionicons name="wallet" size={size} color={color} />;
  }
  if (name === 'favorite') {
    return <Ionicons name={solid ? 'bookmark' : 'bookmark-outline'} size={size} color={color} />;
  }
  if (name === 'privacy') {
    return <MaterialIcons name="privacy-tip" size={size} color={color} />;
  }
  if (name === 'location' || name === 'security') {
    return <Ionicons name={name === 'location' ? 'location-sharp' : 'lock-closed'} size={size} color={color} />;
  }
  if (name === 'verified') {
    // Material verified_user shield, the equivalent of the requested EOS icon.
    return <Svg width={size} height={size} viewBox="0 0 24 24"><Path fill={color} d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" /></Svg>;
  }
  if (name === 'license') {
    // Clarity license-solid (MIT), rendered locally for consistent native output.
    return <Svg width={size} height={size} viewBox="0 0 36 36"><Path fill={color} d="M19 30H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v10.37a8.34 8.34 0 0 0-13.49 9.79l-.93 1.14ZM7 12v1.6h17V12Zm0 5.6h11V16H7Zm0 7h10V23H7Z" /><Path fill={color} d="M33.83 23.59a6.37 6.37 0 1 0-10.77 4.59l-1.94 2.37l.9 3.61l3.66-4.46a6.26 6.26 0 0 0 3.55 0l3.66 4.46l.9-3.61l-1.94-2.37a6.34 6.34 0 0 0 1.98-4.59m-10.74 0a4.37 4.37 0 1 1 4.37 4.31a4.35 4.35 0 0 1-4.36-4.31Z" /></Svg>;
  }
  if (name === 'profile') {
    return <ProfileCircle variant="Bold" size={size} color={color} />;
  }
  if (name === 'vehicle') {
    return <Ionicons name="car-sport-sharp" size={size} color={color} />;
  }
  const Icon = (solid && solidIcons[name]) || icons[name];

  return (
    <Icon
      color={color}
      height={size}
      strokeWidth={strokeWidth}
      width={size}
    />
  );
}

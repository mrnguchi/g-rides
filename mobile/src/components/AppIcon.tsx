import {
  ArrowRight,
  BellNotification,
  BellNotificationSolid,
  Car,
  ChatBubble,
  ChatBubbleQuestion,
  ChatBubbleSolid,
  CheckCircle,
  CheckCircleSolid,
  CreditCard,
  EditPencil,
  Garage,
  HeadsetHelp,
  Heart,
  HeartSolid,
  HelpCircle,
  HelpCircleSolid,
  HomeSimple,
  InfoCircle,
  InfoCircleSolid,
  Language,
  Lock,
  LogOut,
  MapPin,
  NavArrowRight,
  Page,
  Plus,
  PrivacyPolicy,
  RefreshDouble,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  UserStar,
  ViewGrid,
  Wallet,
  WalletSolid,
  Xmark,
} from 'iconoir-react-native';
import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import { colors } from '../theme';

export type AppIconName =
  | 'activity'
  | 'arrowForward'
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
  | 'location'
  | 'logout'
  | 'messages'
  | 'notification'
  | 'plus'
  | 'privacy'
  | 'profile'
  | 'driver'
  | 'fleet'
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

const icons: Record<AppIconName, IconComponent> = {
  activity: ViewGrid,
  arrowForward: ArrowRight,
  chevronRight: NavArrowRight,
  close: Xmark,
  creditCard: CreditCard,
  discover: Search,
  documents: Page,
  edit: EditPencil,
  driver: UserStar,
  favorite: Heart,
  fleet: Garage,
  help: HelpCircle,
  home: HomeSimple,
  info: InfoCircle,
  language: Language,
  location: MapPin,
  logout: LogOut,
  messages: ChatBubble,
  notification: BellNotification,
  plus: Plus,
  privacy: PrivacyPolicy,
  profile: UserCircle,
  security: Lock,
  settings: Settings,
  support: HeadsetHelp,
  swap: RefreshDouble,
  vehicle: Car,
  verified: CheckCircle,
  wallet: Wallet,
};

const solidIcons: Partial<Record<AppIconName, IconComponent>> = {
  favorite: HeartSolid,
  help: HelpCircleSolid,
  info: InfoCircleSolid,
  messages: ChatBubbleSolid,
  notification: BellNotificationSolid,
  verified: CheckCircleSolid,
  wallet: WalletSolid,
};

export function AppIcon({
  color = colors.textPrimary,
  name,
  size = 22,
  solid = false,
  strokeWidth = 1.7,
}: AppIconProps) {
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

import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '../components/AppIcon';
import { WorkspaceBottomNavigation } from '../components/HomeBottomNavigation';
import { colors, fonts, layout } from '../theme';
import type { OwnerTab } from '../types/navigation';
import type { UserRole } from '../types/user';
import { OwnerProfileScreen } from './OwnerProfileScreen';
import type { OwnerProfile } from '../types/ownerProfile';
import { OwnerDashboardScreen } from './OwnerDashboardScreen';
import { OwnerEarningsScreen } from './OwnerEarningsScreen';
import { OwnerFleetScreen } from './OwnerFleetScreen';
import { OwnerBookingsScreen } from './OwnerBookingsScreen';
import type { OwnerBooking } from '../constants/mockOwnerBookings';
import { OwnerVehicleDetailsScreen } from './OwnerVehicleDetailsScreen';
import type { FleetEdits, FleetItem } from '../types/fleet';
import type { UserVehicle } from '../types/vehicle';
import type { OwnerEarningsPeriod } from '../constants/mockOwnerEarnings';
import { MessagesScreen } from './MessagesScreen';
import { ChatScreen } from './ChatScreen';
import type { ChatConversation } from '../types/chat';
import { VehicleFormSheet, type VehicleFormValues } from '../components/VehicleFormSheet';

const tabs: Array<{ key: OwnerTab; label: string; icon: AppIconName }> = [
  { key: 'dashboard', label: 'Dashboard', icon: 'activity' },
  { key: 'fleet', label: 'Fleet', icon: 'fleet' },
  { key: 'bookings', label: 'Bookings', icon: 'bookings' },
  { key: 'messages', label: 'Messages', icon: 'messages' },
  { key: 'profile', label: 'Profile', icon: 'profile' },
];

const descriptions: Record<Exclude<OwnerTab, 'profile'>, string> = {
  dashboard: 'Your rental business at a glance.',
  fleet: 'Your vehicles, availability and daily rates.',
  bookings: 'Your requests, pickups and returns.',
  messages: 'Conversations with renters and drivers.',
};

// Navigation foundation only; owner data and operational screens follow next.
export function OwnerWorkspaceScreen({ enabledRoles, onRoleChange, onLogout, onSaveVehicle, conversations, onReadConversation, onSendMessage, savedVehicles, fleetEdits, onEditVehicle, bookings, onBookingStatusChange, ownerProfile, onOwnerProfileChange }: {
  ownerProfile: OwnerProfile;
  onOwnerProfileChange: (profile: OwnerProfile) => void;
  bookings: OwnerBooking[];
  onBookingStatusChange: (id: string, status: 'Confirmed' | 'Declined') => void;
  fleetEdits: Record<string, FleetEdits>;
  onEditVehicle: (id: string, edits: FleetEdits) => void;
  savedVehicles: UserVehicle[];
  conversations: ChatConversation[];
  onReadConversation: (id: string) => void;
  onSendMessage: (id: string, text: string) => void;
  enabledRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  onSaveVehicle: (values: VehicleFormValues) => void;
}) {
  const [tab, setTab] = useState<OwnerTab>('dashboard');
  const [showEarnings, setShowEarnings] = useState(false);
  const [dashboardBookingId, setDashboardBookingId] = useState<string>();
  const [earningsPeriod, setEarningsPeriod] = useState<OwnerEarningsPeriod>('month');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [selectedVehicle, setSelectedVehicle] = useState<FleetItem>();
  const selectedConversation = conversations.find(item => item.id === conversationId);
  const unreadMessagesCount = conversations.reduce((total, item) => total + item.unreadCount, 0);
  const navigation = <WorkspaceBottomNavigation activeTab={tab} onTabPress={next => { setDashboardBookingId(undefined); setTab(next); }} tabs={tabs} unreadMessagesCount={unreadMessagesCount} />;
  if (selectedConversation) return <ChatScreen key={selectedConversation.id} conversation={selectedConversation} onBack={() => setConversationId(undefined)} onSendMessage={text => onSendMessage(selectedConversation.id, text)} />;
  if (tab === 'bookings') return <OwnerBookingsScreen initialBookingId={dashboardBookingId} navigation={navigation} bookings={bookings} onStatusChange={onBookingStatusChange} onMessage={id => { onReadConversation(id); setConversationId(id); }} />;
  if (tab === 'messages') return <MessagesScreen subtitle="Chat with renters, drivers, and support" conversations={conversations} unreadMessagesCount={unreadMessagesCount} bottomNavigation={navigation} onOpenConversation={id => { onReadConversation(id); setConversationId(id); }} />;
  if (showEarnings) return <OwnerEarningsScreen period={earningsPeriod} onPeriodChange={setEarningsPeriod} onBack={() => setShowEarnings(false)} />;
  if (selectedVehicle) return <OwnerVehicleDetailsScreen key={selectedVehicle.id} car={{ ...selectedVehicle, ...fleetEdits[selectedVehicle.id] }} onBack={() => setSelectedVehicle(undefined)} onSave={edits => onEditVehicle(selectedVehicle.id, edits)} />;
  if (tab === 'fleet') return <>
    <OwnerFleetScreen savedVehicles={savedVehicles} edits={fleetEdits} onOpenVehicle={setSelectedVehicle} navigation={navigation} onAddVehicle={() => setShowVehicleForm(true)} />
    <VehicleFormSheet activeRole="owner" visible={showVehicleForm} onClose={() => setShowVehicleForm(false)} onSave={values => { onSaveVehicle(values); setShowVehicleForm(false); }} />
  </>;
  if (tab === 'dashboard') return <>
    <OwnerDashboardScreen bookings={bookings} onOpenBooking={id => { setDashboardBookingId(id); setTab('bookings'); }} profileName={ownerProfile.name} profileImage={ownerProfile.photoUri ? { uri: ownerProfile.photoUri } : undefined} period={earningsPeriod} onPeriodChange={setEarningsPeriod} navigation={navigation} onOpenEarnings={() => setShowEarnings(true)} onOpenFleet={() => setTab('fleet')} onOpenBookings={() => { setDashboardBookingId(undefined); setTab('bookings'); }} onOpenProfile={() => setTab('profile')} onAddVehicle={() => setShowVehicleForm(true)} />
    <VehicleFormSheet activeRole="owner" visible={showVehicleForm} onClose={() => setShowVehicleForm(false)} onSave={(values) => { onSaveVehicle(values); setShowVehicleForm(false); setTab('fleet'); }} />
  </>;
  if (tab === 'profile') {
    return <OwnerProfileScreen profile={ownerProfile} onChange={onOwnerProfileChange} enabledRoles={enabledRoles} onRoleChange={onRoleChange} onLogout={onLogout} navigation={navigation} onSupport={() => { onReadConversation('owner-chat-support'); setConversationId('owner-chat-support'); }} />;
  }
  const selected = tabs.find(item => item.key === tab)!;
  return <View style={styles.screen}>
    <StatusBar style="light" />
    <SafeAreaView edges={['top']} style={styles.header}>
      <Text style={styles.eyebrow}>CAR OWNER</Text>
      <Text style={styles.title}>{selected.label}</Text>
      <Text style={styles.subtitle}>{descriptions[tab]}</Text>
    </SafeAreaView>
    <View style={styles.sheet}>
      <View style={styles.icon}><AppIcon name={selected.icon} color={colors.primaryBrandBlue} size={30} /></View>
      <Text style={styles.emptyTitle}>{selected.label} coming soon</Text>
      <Text style={styles.emptyCopy}>Your car owner workspace is ready. This section will be available soon.</Text>
    </View>
    {navigation}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark },
  header: { paddingHorizontal: layout.screenGutter, paddingTop: 24, paddingBottom: 28 },
  eyebrow: { color: '#A9BCD6', fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.4 },
  title: { color: colors.white, fontFamily: fonts.bold, fontSize: 30, marginTop: 10 },
  subtitle: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 14, marginTop: 7 },
  sheet: { flex: 1, backgroundColor: colors.backgroundLight, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 130, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 68, height: 68, borderRadius: 24, backgroundColor: '#EDF4FE', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.textPrimary, fontFamily: fonts.semiBold, fontSize: 18, marginTop: 20 },
  emptyCopy: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10 },
});

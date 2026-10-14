import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '../components/AppIcon';
import { WorkspaceBottomNavigation } from '../components/HomeBottomNavigation';
import { RoleSwitchSheet } from '../components/RoleSwitchSheet';
import { ProfileLogoutFooter } from '../components/ProfileLogoutFooter';
import { colors, fonts, layout, shadows, surfaces } from '../theme';
import type { UserRole } from '../types/user';
import type { ChatConversation } from '../types/chat';
import { MOCK_HOME_VEHICLES } from '../constants/mockVehicles';
import { DriverVehicleScreen, type DriverAssignment } from './DriverVehicleScreen';
import { ChatScreen } from './ChatScreen';

type Tab = 'home' | 'vehicle' | 'profile';
type Trip = { id: string; customer: string; date: string; pickup: string; destination: string; status: 'Scheduled' | 'Arrived' | 'In progress' | 'Completed' };
const tabs: { key: Tab; label: string; icon: AppIconName }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'vehicle', label: 'My Vehicle', icon: 'vehicle' },
  { key: 'profile', label: 'Profile', icon: 'profile' },
];
const carImage = require('../../assets/images/cars/toyota/Yaris/yaris 2010.png');
// The same assigned Yaris appears in Home and My Vehicle for this UI preview.
const assignment: DriverAssignment = {
  vehicle: MOCK_HOME_VEHICLES[0],
  ownerName: 'Alex M.',
  handoverLocation: MOCK_HOME_VEHICLES[0].rentalTerms?.pickupLocation,
};
const ownerConversation: ChatConversation = {
  id: 'driver-assigned-owner', unreadCount: 0, bookingLabel: 'Assigned vehicle',
  vehicle: assignment.vehicle,
  participant: { id: 'driver-vehicle-owner', name: assignment.ownerName, role: 'Car owner', isOnline: false, avatar: require('../../assets/images/10007.png') },
  messages: [],
};
// UI fixtures only. Assignments and trip updates will come from the service later.
function initialTrips(): Trip[] {
  return ['Alex M.', 'Marie N.', 'Daniel T.'].map((customer, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    date.setHours(9 + index, 0, 0, 0);
    return { id: `driver-trip-${index}`, customer, date: date.toISOString(), pickup: ['Bonapriso, Douala', 'Akwa, Douala', 'Bonaberi, Douala'][index], destination: ['Limbe town centre', 'Douala International Airport', 'Buea town centre'][index], status: 'Scheduled' };
  });
}
const tripTime = (trip: Trip) => new Date(trip.date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function DriverWorkspaceScreen({ enabledRoles, onRoleChange, onLogout }: { enabledRoles: UserRole[]; onRoleChange: (role: UserRole) => void; onLogout: () => void }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('home');
  const [available, setAvailable] = useState(true);
  const [trips, setTrips] = useState(initialTrips);
  const [selectedId, setSelectedId] = useState<string>();
  const [panel, setPanel] = useState<'notifications' | 'all' | 'trip' | undefined>();
  const [switching, setSwitching] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation>(ownerConversation);
  const selected = trips.find(trip => trip.id === selectedId);
  const remaining = trips.filter(trip => trip.status !== 'Completed');
  const next = remaining[0];
  const upcoming = remaining.slice(1);
  const openTrip = (trip: Trip) => { setSelectedId(trip.id); setPanel('trip'); };
  const detail = (label: string, value: string) => <View style={s.detail}><Text style={s.copy}>{label}</Text><Text style={s.value}>{value}</Text></View>;
  const tripRow = (trip: Trip) => <Pressable key={trip.id} accessibilityRole="button" accessibilityLabel={`View trip with ${trip.customer}`} onPress={() => openTrip(trip)} style={s.tripRow}><View style={s.icon}><AppIcon name="bookings" color={colors.primaryBrandBlue} /></View><View style={s.flex}><Text style={s.rowTitle}>{trip.destination}</Text><Text style={s.copy}>{tripTime(trip)}</Text><Text style={s.small}>{trip.customer} · {trip.status}</Text></View><AppIcon name="chevronRight" size={19} /></Pressable>;

  if (chatOpen) return <ChatScreen conversation={conversation} onBack={() => setChatOpen(false)} onSendMessage={text => setConversation(current => ({ ...current, messages: [...current.messages, { id: `driver-message-${Date.now()}`, text, sender: 'me', sentAt: new Date().toISOString(), status: 'sent' }] }))} />;

  return tab === 'vehicle' ? <DriverVehicleScreen assignment={assignment} onMessageOwner={() => setChatOpen(true)} navigation={<WorkspaceBottomNavigation tabs={tabs} activeTab={tab} onTabPress={setTab} />} /> : <View style={s.screen}>
    <StatusBar style="light" />
    <SafeAreaView edges={['top']} style={s.header}>
      <View style={s.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open driver profile" onPress={() => setTab('profile')} style={s.avatar}><AppIcon name="profile" color={colors.white} size={34} /></Pressable>
        <View style={s.flex}><Text style={s.headerHint}>Welcome back,</Text><Text style={s.name}>Munoh Nguchi</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Open notifications" onPress={() => setPanel('notifications')} style={s.bell}><AppIcon name="notification" color={colors.white} size={25} /></Pressable>
      </View>
      <Text style={s.heading}>{tab === 'home' ? 'Your next journey' : 'Driver profile'}</Text>
      <Text style={s.headerHint}>{tab === 'home' ? 'Your trips, all in one place.' : 'Manage your G-Rides profile.'}</Text>
    </SafeAreaView>
    <View style={s.body}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: 115 + insets.bottom }]}>
      {tab === 'home' && <>
        <View style={s.availability}><View style={s.flex}><Text style={s.rowTitle}>{available ? 'Available for trips' : 'Unavailable for new trips'}</Text><Text style={s.copy}>Your scheduled trips stay in place.</Text></View><Switch accessibilityLabel="Available for new assignments" value={available} onValueChange={setAvailable} trackColor={{ false: colors.borderGray, true: colors.primaryBrandBlue }} /></View>
        <Text style={s.section}>{next?.status === 'In progress' ? 'Current trip' : 'Next trip'}</Text>
        {next ? <View style={s.card}>
          <View style={s.row}><Text style={s.badge}>{next.status}</Text><Text style={s.copy}>{tripTime(next)}</Text></View>
          <Text style={s.customer}>{next.customer}</Text>
          <View style={s.route}><View style={s.routeLine}><AppIcon name="location" size={19} color={colors.primaryBrandBlue} /><View style={s.flex}><Text style={s.small}>Pickup</Text><Text style={s.value}>{next.pickup}</Text></View></View><View style={s.routeLine}><AppIcon name="location" size={19} color={colors.textSecondary} /><View style={s.flex}><Text style={s.small}>Destination</Text><Text style={s.value}>{next.destination}</Text></View></View></View>
          <Pressable accessibilityRole="button" accessibilityLabel="View assigned vehicle" onPress={() => setTab('vehicle')} style={s.carRow}><Image source={carImage} resizeMode="contain" style={s.carThumb} /><View style={s.flex}><Text style={s.rowTitle}>Toyota Yaris 2010</Text><Text style={s.small}>Assigned vehicle</Text></View><AppIcon name="chevronRight" size={18} /></Pressable>
          <Pressable accessibilityRole="button" onPress={() => openTrip(next)} style={s.button}><Text style={s.buttonText}>View trip</Text><AppIcon name="arrowUpRight" color={colors.white} size={21} /></Pressable>
        </View> : <View style={s.empty}><View style={s.icon}><AppIcon name="bookings" size={28} color={colors.primaryBrandBlue} /></View><Text style={s.rowTitle}>No trips assigned yet</Text><Text style={s.centerCopy}>Your next assignment will appear here.</Text></View>}
        <View style={s.sectionRow}><Text style={s.section}>Upcoming trips</Text><Pressable accessibilityRole="button" onPress={() => setPanel('all')} hitSlop={10}><Text style={s.link}>See all</Text></Pressable></View>
        {upcoming.length ? upcoming.slice(0, 2).map(tripRow) : <Text style={s.copy}>No other trips scheduled.</Text>}
      </>}
      {tab === 'profile' && <><View style={s.card}><View style={s.row}><View style={s.icon}><AppIcon name="profile" size={32} color={colors.primaryBrandBlue} /></View><View style={s.flex}><Text style={s.customer}>Munoh Nguchi</Text><Text style={s.copy}>Driver profile</Text></View></View><Text style={s.copy}>Rent a car or manage your vehicles with another profile.</Text><Pressable accessibilityRole="button" onPress={() => setSwitching(true)} style={s.button}><Text style={s.buttonText}>Switch profile</Text><AppIcon name="swap" color={colors.white} /></Pressable></View><ProfileLogoutFooter onLogout={onLogout} /></>}
    </ScrollView></View>
    <WorkspaceBottomNavigation tabs={tabs} activeTab={tab} onTabPress={setTab} />
    <RoleSwitchSheet activeRole="driver" enabledRoles={enabledRoles} onRoleChange={onRoleChange} onSetupRole={onRoleChange} onClose={() => setSwitching(false)} visible={switching} />
    <Modal transparent animationType="slide" visible={!!panel} onRequestClose={() => setPanel(undefined)}><View style={s.modal}><Pressable accessibilityRole="button" accessibilityLabel="Close sheet" style={s.backdrop} onPress={() => setPanel(undefined)} /><View style={[s.sheet, { paddingBottom: Math.max(20, insets.bottom) }]}><View style={s.handle} /><View style={s.row}><Text style={s.section}>{panel === 'notifications' ? 'Notifications' : panel === 'all' ? 'Your trips' : 'Trip details'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={12} onPress={() => setPanel(undefined)}><AppIcon name="close" /></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetContent}>
      {panel === 'notifications' && <View style={s.empty}><View style={s.icon}><AppIcon name="notification" size={30} color={colors.primaryBrandBlue} /></View><Text style={s.rowTitle}>You're all caught up</Text><Text style={s.centerCopy}>New assignments and trip updates will appear here.</Text></View>}
      {panel === 'all' && trips.map(tripRow)}
      {panel === 'trip' && selected && <><Text style={s.badge}>{selected.status}</Text><Text style={s.customer}>{selected.customer}</Text>{detail('Pickup time', tripTime(selected))}{detail('Pickup location', selected.pickup)}{detail('Destination', selected.destination)}{detail('Vehicle', 'Toyota Yaris 2010')}<Text style={s.copy}>Contact details will appear when provided by the customer or owner.</Text>{selected.status !== 'Completed' && <Pressable accessibilityRole="button" style={s.button} onPress={() => setTrips(current => current.map(trip => trip.id === selected.id ? { ...trip, status: trip.status === 'Scheduled' ? 'Arrived' : trip.status === 'Arrived' ? 'In progress' : 'Completed' } : trip))}><Text style={s.buttonText}>{selected.status === 'Scheduled' ? "I've arrived" : selected.status === 'Arrived' ? 'Start trip' : 'Complete trip'}</Text></Pressable>}</>}
    </ScrollView></View></View></Modal>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark }, header: { paddingHorizontal: layout.screenGutter, paddingBottom: 26, paddingTop: 14 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, flex: { flex: 1 }, avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#293449', alignItems: 'center', justifyContent: 'center' }, bell: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#293449', alignItems: 'center', justifyContent: 'center' }, headerHint: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 14, lineHeight: 22 }, name: { color: colors.white, fontFamily: fonts.bold, fontSize: 20, marginTop: 3 }, heading: { color: colors.white, fontFamily: fonts.bold, fontSize: 28, marginTop: 24, marginBottom: 6 }, body: { flex: 1, backgroundColor: surfaces.canvas, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' }, content: { padding: layout.screenGutter, paddingTop: 24 }, availability: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 }, section: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginVertical: 16 }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }, card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, gap: 14, ...shadows.soft }, badge: { alignSelf: 'flex-start', backgroundColor: surfaces.blueSoft, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, color: colors.primaryBrandBlue, fontFamily: fonts.semiBold, fontSize: 12 }, customer: { fontFamily: fonts.bold, color: colors.textPrimary, fontSize: 22 }, copy: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 }, small: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 }, value: { color: colors.textPrimary, fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 23 }, rowTitle: { color: colors.textPrimary, fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 23 }, route: { gap: 18, paddingVertical: 6 }, routeLine: { flexDirection: 'row', gap: 12, alignItems: 'center' }, carRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: surfaces.muted, borderRadius: 18, padding: 10 }, carThumb: { width: 85, height: 50 }, carHero: { width: '100%', height: 180 }, button: { minHeight: 50, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 28, backgroundColor: colors.primaryBrandBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, buttonText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.white }, tripRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, backgroundColor: colors.white, marginBottom: 14, ...shadows.soft }, icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: surfaces.blueSoft, alignItems: 'center', justifyContent: 'center' }, link: { color: colors.primaryBrandBlue, fontFamily: fonts.semiBold, fontSize: 14 }, empty: { alignItems: 'center', gap: 14, padding: 28, backgroundColor: colors.white, borderRadius: 24 }, centerCopy: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, textAlign: 'center' }, modal: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.55)' }, sheet: { maxHeight: '88%', backgroundColor: surfaces.canvas, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22 }, handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.borderGray, alignSelf: 'center', marginTop: 12 }, sheetContent: { paddingVertical: 12, gap: 14 }, detail: { gap: 4, paddingVertical: 8 },
});

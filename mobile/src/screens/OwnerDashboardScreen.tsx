import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '../components/AppIcon';
import { colors, fonts, layout, shadows, moneyText, statusText } from '../theme';
import { MOCK_OWNER_EARNINGS, getOwnerEarningsPeriod, type OwnerEarningsPeriod } from '../constants/mockOwnerEarnings';
import type { OwnerBooking } from '../constants/mockOwnerBookings';
import { EarningsPeriodPicker } from '../components/EarningsPeriodPicker';

type Props = { bookings: OwnerBooking[]; onOpenBooking: (id: string) => void; profileName?: string; profileImage?: ImageSourcePropType | null; period: OwnerEarningsPeriod; onPeriodChange: (period: OwnerEarningsPeriod) => void; navigation: ReactNode; onOpenEarnings: () => void; onOpenFleet: () => void; onOpenBookings: () => void; onAddVehicle: () => void; onOpenProfile: () => void };
const defaultProfileImage = require('../../assets/images/10075.jpeg');
// Sample owner activity until the booking and payment systems are connected.
const activity = [
  { id: 'request', icon: 'bookings', title: 'New booking request', detail: 'Toyota Yaris 2012 · Alex M.', time: 'Today, 10:30 AM', status: 'Awaiting review' },
  { id: 'payment', icon: 'wallet', title: 'Rental payment', detail: 'Toyota 4Runner · Danielle N.', time: 'Today, 9:15 AM', status: '+75,000 XAF' },
  { id: 'pickup', icon: 'vehicle', title: 'Pickup scheduled', detail: 'Toyota Yaris 2013 · Chris T.', time: 'Today, 12:00 PM', status: 'Upcoming' },
  { id: 'return', icon: 'verified', title: 'Vehicle returned', detail: 'Toyota Yaris 2010 · Jordan K.', time: 'Yesterday, 4:30 PM', status: 'Completed' },
] as const;

export function OwnerDashboardScreen({ bookings, onOpenBooking, profileName = 'Munoh Nguchi', profileImage = defaultProfileImage, period, onPeriodChange, navigation, onOpenEarnings, onOpenFleet, onOpenBookings, onAddVehicle, onOpenProfile }: Props) {
  const [bookingFilter, setBookingFilter] = useState<'Requests' | 'Ongoing' | 'Upcoming'>('Requests');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const filterStatus = { Requests: 'Requested', Ongoing: 'In progress', Upcoming: 'Confirmed' };
  const filteredBookings = bookings.filter(booking => booking.status === filterStatus[bookingFilter]);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => setAvatarFailed(false), [profileImage]);
  const earningsPeriod = getOwnerEarningsPeriod(period);
  const insets = useSafeAreaInsets();
  const [panel, setPanel] = useState<'notifications' | 'activity'>();
  const panelDrag = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && gesture.dy > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 60 || gesture.vy > 0.8) setPanel(undefined);
    },
  }), []);
  const actions: Array<{ title: string; subtitle: string; icon: AppIconName; onPress: () => void }> = [
    { title: 'Add vehicle', subtitle: 'Grow your fleet', icon: 'plus', onPress: onAddVehicle },
    { title: 'Bookings', subtitle: 'Review new requests', icon: 'bookings', onPress: onOpenBookings },
    { title: 'Fleet', subtitle: 'Manage your vehicles', icon: 'fleet', onPress: onOpenFleet },
    { title: 'Earnings', subtitle: 'Income and payouts', icon: 'wallet', onPress: onOpenEarnings },
  ];
  const rows = activity.map(item => <Pressable key={item.id} accessibilityRole="button" onPress={() => { setPanel(undefined); item.id === 'payment' ? onOpenEarnings() : onOpenBookings(); }} style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}>
    <View style={[styles.activityIcon, item.id === 'payment' && styles.successSoft]}><AppIcon name={item.icon} color={item.id === 'payment' ? colors.success : colors.primaryBrandBlue} size={19} /></View>
    <View style={styles.activityCopy}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activityDetail}>{item.detail}</Text>
      <View style={polish.activityFooter}>
        <Text style={styles.activityTime}>{item.time}</Text>
        <Text style={[polish.status, item.id === 'payment' && [polish.payment, moneyText]]}>{item.status}</Text>
      </View>
    </View>
  </Pressable>);
  return <View style={styles.screen}>
    <StatusBar style="light" />
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.fixedTop}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open owner profile" onPress={onOpenProfile} style={styles.avatarContainer}>
            <AppIcon name="profile" size={28} color={colors.white} />
            {profileImage && !avatarFailed && <Image source={profileImage} resizeMode="cover" onError={() => setAvatarFailed(true)} style={styles.avatar} />}
          </Pressable>
          <View style={styles.headerCopy}><Text style={styles.greeting}>Welcome back,</Text><Text style={styles.name}>{profileName}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Owner notifications" onPress={() => setPanel('notifications')} style={[styles.notification, styles.headerNotification]}><AppIcon name="notification" size={23} color={colors.white} /></Pressable>
        </View>
      </View>
      <View style={styles.contentSheet}>
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        <View style={e.card}>
          <View style={e.cardTop}><EarningsPeriodPicker value={period} onChange={onPeriodChange} /><View style={e.walletIcon}><AppIcon name="wallet" color={colors.primaryBrandBlue} size={22} /></View></View>
          <View style={e.totalLabel}><Text style={e.muted}>Total earnings</Text><Pressable accessibilityRole="button" accessibilityLabel={balanceVisible ? 'Hide balances' : 'Show balances'} onPress={() => setBalanceVisible(value => !value)} hitSlop={10}><Text style={e.link}>{balanceVisible ? 'Hide' : 'Show'}</Text></Pressable></View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={e.amount}>{balanceVisible ? earningsPeriod.amount.toLocaleString('en-US') : '••••••'} <Text style={e.currency}>XAF</Text></Text>
          <View style={e.availableRow}><Text style={e.muted}>Available balance</Text><Text style={e.available}>{balanceVisible ? MOCK_OWNER_EARNINGS.available.toLocaleString('en-US') + ' XAF' : '••••••'}</Text></View>
          <View style={e.buttons}><Pressable accessibilityRole="button" onPress={onOpenEarnings} style={[e.button, e.primary]}><Text style={e.whiteLabel}>View earnings</Text><AppIcon name="arrowUpRight" size={18} color={colors.white} /></Pressable><Pressable accessibilityRole="button" onPress={() => Alert.alert('Withdraw funds', 'Withdrawals are not available yet. Your available balance is ' + MOCK_OWNER_EARNINGS.available.toLocaleString('en-US') + ' XAF.')} style={[e.button, e.secondary]}><AppIcon name="wallet" size={18} color={colors.primaryBrandBlue} /><Text style={e.link}>Withdraw</Text></Pressable></View>
        </View>
        <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Quick actions</Text>
        <View style={styles.actions}>{actions.map(action => <Pressable key={action.title} accessibilityRole="button" onPress={action.onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <View style={styles.actionIcon}><AppIcon name={action.icon} color={colors.primaryBrandBlue} size={28} strokeWidth={1.65} /></View><Text style={styles.actionTitle}>{action.title}</Text>
        </Pressable>)}</View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Bookings</Text><Pressable accessibilityRole="button" onPress={onOpenBookings} style={styles.seeAll}><Text style={styles.link}>See all</Text></Pressable></View>
        <View style={e.filters}>{(['Requests', 'Ongoing', 'Upcoming'] as const).map(filter => <Pressable key={filter} accessibilityRole="tab" accessibilityState={{ selected: filter === bookingFilter }} onPress={() => setBookingFilter(filter)} style={[e.filter, filter === bookingFilter && e.selectedFilter]}><Text style={[e.filterLabel, filter === bookingFilter && e.selectedLabel]}>{filter} {bookings.filter(booking => booking.status === filterStatus[filter]).length}</Text></Pressable>)}</View>
        {filteredBookings.length ? filteredBookings.slice(0, 3).map(booking => <Pressable key={booking.id} accessibilityRole="button" accessibilityLabel={'View booking ' + booking.id} onPress={() => onOpenBooking(booking.id)} style={({pressed}) => [e.bookingCard, pressed && styles.pressed]}><View style={e.bookingTop}><Image source={booking.vehicle.image} resizeMode="contain" style={e.car} /><View style={e.bookingCopy}><Text style={e.carName}>{booking.vehicle.brand} {booking.vehicle.model}</Text><Text style={e.muted}>{booking.renter}</Text></View><AppIcon name="chevronRight" size={19} color={colors.primaryBrandBlue} /></View><View style={e.bookingBottom}><Text style={e.date}>{new Date(booking.pickup).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} – {new Date(booking.returnAt).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}</Text><Text style={e.status}>{booking.status === 'Requested' ? 'Needs review' : booking.status}</Text></View></Pressable>) : <View style={e.empty}><AppIcon name="bookings" color={colors.primaryBrandBlue} size={28} /><Text style={e.carName}>No {bookingFilter.toLowerCase()} bookings</Text><Text style={e.muted}>Your bookings will appear here.</Text></View>}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent activity</Text><Pressable accessibilityRole="button" onPress={() => setPanel('activity')} style={styles.seeAll}><Text style={styles.link}>See all</Text></Pressable></View>
        <View style={styles.activityList}>{rows.slice(0, 3)}</View>
      </ScrollView>
      </View>
    </SafeAreaView>
    {navigation}
    <Modal transparent visible={panel !== undefined} animationType="slide" onRequestClose={() => setPanel(undefined)}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close panel" style={styles.backdrop} onPress={() => setPanel(undefined)} />
        <View accessibilityViewIsModal style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.handleArea} {...panelDrag.panHandlers}><View style={styles.handle} /></View>
          <View style={styles.panelHeader}><Text style={styles.panelTitle}>{panel === 'activity' ? 'Recent activity' : 'Notifications'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close panel" onPress={() => setPanel(undefined)} style={styles.notification}><AppIcon name="close" size={22} /></Pressable></View>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>{panel === 'activity' ? rows : <View style={styles.notificationEmpty}>
            <View style={styles.emptyBellHalo}><View style={styles.emptyBell}><AppIcon name="notification" color={colors.primaryBrandBlue} size={34} strokeWidth={1.6} /></View></View>
            <Text style={styles.emptyTitle}>You’re all caught up</Text>
            <Text style={styles.emptyDescription}>Booking requests, pickup reminders, and account updates will appear here.</Text>
          </View>}</ScrollView>
        </View>
      </View>
    </Modal>
  </View>;
}
const e = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 26, padding: 20, ...shadows.soft, shadowOpacity: 0.09, shadowRadius: 18, shadowOffset: { width: 0, height: 7 } },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, walletIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center' },
  totalLabel: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }, muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textSecondary }, link: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primaryBrandBlue },
  amount: { ...moneyText, fontFamily: fonts.moneyExtraBold, fontSize: 30, color: colors.primaryDark, marginTop: 5 }, currency: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textSecondary }, availableRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 8 }, available: { ...moneyText, fontFamily: fonts.moneyExtraBold, fontSize: 16, color: colors.primaryBrandBlue },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 22 }, button: { flex: 1, minHeight: 44, paddingHorizontal: 9, paddingVertical: 11, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, primary: { backgroundColor: colors.primaryBrandBlue }, secondary: { backgroundColor: '#EDF2FF' }, whiteLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.white },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 18 }, filter: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: colors.white, padding: 8 }, selectedFilter: { backgroundColor: colors.primaryBrandBlue }, filterLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSecondary }, selectedLabel: { color: colors.white },
  bookingCard: { backgroundColor: colors.white, borderRadius: 23, padding: 16, marginBottom: 16, ...shadows.soft }, bookingTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, car: { width: 88, height: 70, backgroundColor: '#F6F8FC', borderRadius: 16 }, bookingCopy: { flex: 1, minWidth: 0 }, carName: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 21, color: colors.textPrimary }, bookingBottom: { marginTop: 14, gap: 10 }, date: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSecondary }, status: { alignSelf: 'flex-start', fontSize: 12, color: colors.primaryBrandBlue, backgroundColor: '#EDF2FF', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, ...statusText }, empty: { alignItems: 'center', padding: 26, gap: 12 },
});
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark }, safeArea: { flex: 1 }, content: { paddingHorizontal: layout.screenGutter, paddingTop: 22 },
  fixedTop: { paddingHorizontal: layout.screenGutter, paddingTop: 14, paddingBottom: 22, backgroundColor: colors.primaryDark },
  contentSheet: { flex: 1, backgroundColor: '#F6F8FC', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  scrollArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 }, headerCopy: { flex: 1 },
  avatarContainer: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  avatar: { ...StyleSheet.absoluteFill, width: 44, height: 44, borderRadius: 22 },
  greeting: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 13, color: '#CBD5E1' }, name: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 17, color: colors.white, marginTop: 4 },
  notification: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  headerNotification: { backgroundColor: 'rgba(255,255,255,0.12)' },
  earnings: { marginTop: 20, marginBottom: 26 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 20, marginTop: 4 },
  earnedColumn: { flex: 1.2 }, availableColumn: { flex: 1, alignItems: 'flex-end' },
  amount: { fontSize: 34, color: colors.earningsMint,  ...moneyText },
  availableAmount: { fontSize: 30, color: colors.white, textAlign: 'right',  ...moneyText },
  amountLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  viewEarnings: { backgroundColor: colors.backgroundLight, borderRadius: 24, minHeight: 42, paddingHorizontal: 17, paddingVertical: 10, justifyContent: 'center', marginTop: 13 },
  viewEarningsText: { color: colors.primaryDark, fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 13 },
  earningsHint: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 13, lineHeight: 20, color: '#CBD5E1' }, sectionTitle: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 17, color: colors.textPrimary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 }, action: { flexGrow: 1, flexBasis: '45%', minHeight: 88, flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 15, paddingVertical: 16, borderRadius: 20, borderWidth: 1, borderColor: '#DCE4F2', backgroundColor: colors.white },
  actionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F0F4FC', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }, actionTitle: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 13, lineHeight: 19, flexShrink: 1, color: colors.textPrimary }, actionSubtitle: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 13, lineHeight: 20, color: '#566174', marginTop: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 8 }, seeAll: { minHeight: 44, justifyContent: 'center', paddingLeft: 16 }, link: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 14, color: colors.primaryBrandBlue },
  activityList: { gap: 12 }, activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, marginBottom: 12, borderRadius: 20, backgroundColor: colors.white, ...shadows.soft },
  activityIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#EDF4FE', alignItems: 'center', justifyContent: 'center' }, activityCopy: { flex: 1, minWidth: 0 }, activityTitle: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 13, lineHeight: 20, color: colors.textPrimary },
  activityDetail: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 12, lineHeight: 18, color: '#566174', marginTop: 5 }, activityTime: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: '#566174', marginTop: 4 },
  activityStatus: { maxWidth: '28%', fontSize: 12, lineHeight: 18, textAlign: 'right', color: colors.primaryBrandBlue, ...statusText }, successSoft: { backgroundColor: '#EAF7EF' }, successText: { color: colors.success }, pressed: { opacity: 0.7 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.45)' }, panel: { maxHeight: '80%', backgroundColor: colors.backgroundLight, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, panelTitle: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 22, color: colors.textPrimary },
  handleArea: { alignItems: 'center', justifyContent: 'center', height: 28, marginTop: -14, marginBottom: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderGray },
  notificationEmpty: { alignItems: 'center', paddingTop: 14, paddingBottom: 36, paddingHorizontal: 12 },
  emptyBellHalo: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4FC', marginBottom: 24 },
  emptyBell: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5EDFC' },
  emptyTitle: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 19, color: colors.textPrimary, textAlign: 'center' },
  emptyDescription: { maxWidth: 290, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: '#566174', textAlign: 'center', marginTop: 10 },
});

const polish = StyleSheet.create({
  activityFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 },
  status: { alignSelf: 'flex-start', fontSize: 11, lineHeight: 17, color: colors.primaryBrandBlue, backgroundColor: '#EDF2FF', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12, ...statusText },
  payment: { color: colors.success, backgroundColor: '#EAF7EF', fontSize: 13 },
});

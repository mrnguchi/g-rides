import { useMemo, useState, type ReactNode } from 'react';
import { FlatList, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppIcon } from '../components/AppIcon';
import type { OwnerBooking, OwnerBookingStatus } from '../constants/mockOwnerBookings';
import { colors, fonts, layout, moneyText, statusText } from '../theme';

const filters = ['All', 'Requests', 'Upcoming', 'Ongoing', 'History'] as const;
type Filter = typeof filters[number];
const matches = (booking: OwnerBooking, filter: Filter) => filter === 'All' || (filter === 'Requests' ? booking.status === 'Requested' : filter === 'Upcoming' ? booking.status === 'Confirmed' : filter === 'Ongoing' ? booking.status === 'In progress' : ['Completed', 'Cancelled', 'Declined'].includes(booking.status));
const money = (amount: number) => `${amount.toLocaleString('en-US')} XAF`;
const date = (value: string, time = false) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(time ? { year: 'numeric', hour: '2-digit', minute: '2-digit' } : {}) });
const statusColor = (status: OwnerBookingStatus) => status === 'Completed' ? '#287E48' : status === 'Requested' ? '#916000' : ['Cancelled', 'Declined'].includes(status) ? '#9B4545' : colors.primaryBrandBlue;

export function OwnerBookingsScreen({ navigation, bookings, onStatusChange, onMessage, initialBookingId }: {
  initialBookingId?: string;
  navigation: ReactNode; bookings: OwnerBooking[];
  onStatusChange: (id: string, status: 'Confirmed' | 'Declined') => void;
  onMessage: (conversationId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedId, setSelectedId] = useState<string | undefined>(initialBookingId);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const selected = bookings.find(item => item.id === selectedId);
  const close = () => { setSelectedId(undefined); setConfirmDecline(false); };
  const drag = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8 && gesture.dy > Math.abs(gesture.dx),
    onPanResponderRelease: (_, gesture) => { if (gesture.dy > 45 || gesture.vy > 0.7) close(); },
  }), []);
  const badge = (status: OwnerBookingStatus) => <Text style={[styles.badge, { color: statusColor(status), backgroundColor: `${statusColor(status)}10` }]}>{status === 'Requested' ? 'New request' : status}</Text>;
  const row = (label: string, value: string) => <View key={label} style={styles.detailRow}><Text style={styles.muted}>{label}</Text><Text style={[styles.detailValue, value.includes('XAF') && moneyText, label === 'Payment' && statusText]}>{value}</Text></View>;
  return <View style={styles.screen}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top']} style={styles.flex}>
      <View style={styles.header}><Text style={styles.title}>Bookings</Text><Text style={styles.subtitle}>Your requests, pickups and returns.</Text></View>
      <View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.activeFilter]}><Text style={[styles.filterText, filter === value && styles.white]}>{value}  {bookings.filter(item => matches(item, value)).length}</Text></Pressable>)}</ScrollView></View>
      <FlatList data={bookings.filter(item => matches(item, filter))} keyExtractor={item => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: 125 + insets.bottom }]}
        ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="bookings" size={30} color={colors.primaryBrandBlue} /></View><Text style={styles.emptyTitle}>No {filter === 'All' ? 'bookings' : filter.toLowerCase()} yet</Text><Text style={styles.subtitle}>Bookings will appear here as your rentals progress.</Text></View>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.vehicle.brand} ${item.vehicle.model}, ${item.renter}, ${item.status}. View booking`} onPress={() => { setSelectedId(item.id); setConfirmDecline(false); }} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.cardTop}><Image source={item.vehicle.image} resizeMode="contain" style={styles.carImage} /><View style={styles.cardCopy}><Text style={styles.carName}>{item.vehicle.brand} {item.vehicle.model}</Text><Text style={styles.renter}>{item.renter}</Text><Text style={styles.dates}>{date(item.pickup)} – {date(item.returnAt)}</Text></View><AppIcon name="chevronRight" size={18} color={colors.textSecondary} /></View>
          <View style={styles.cardFooter}>{badge(item.status)}<Text style={styles.amount}>{money(item.vehicle.pricePerDayXaf * item.days)}</Text></View>
        </Pressable>} />
    </SafeAreaView>
    {navigation}
    <Modal transparent visible={!!selected} animationType="slide" onRequestClose={close}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="Close booking details" onPress={close} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20), maxHeight: '90%' }]}>
          <View style={styles.handleArea} {...drag.panHandlers}><View style={styles.handle} /></View>
          <View style={styles.sheetHeading}><Text style={styles.sheetTitle}>Booking details</Text><Pressable accessibilityRole="button" accessibilityLabel="Close booking details" onPress={close} style={styles.close}><AppIcon name="close" size={21} /></Pressable></View>
          {selected && <>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.bookingHero}><Image source={selected.vehicle.image} resizeMode="contain" style={styles.carImage} /><View style={styles.flex}><Text style={styles.carName}>{selected.vehicle.brand} {selected.vehicle.model}</Text><Text style={styles.muted}>Booking #{selected.id}</Text></View></View>
              <View style={styles.statusPanel}><Text style={styles.muted}>Status</Text>{badge(selected.status)}</View>
              <View style={styles.group}>{row('Renter', selected.renter)}{row('Pickup', date(selected.pickup, true))}{row('Return', date(selected.returnAt, true))}{row('Duration', `${selected.days} days`)}</View>
              <View style={styles.group}>{row('Pickup type', selected.pickupType)}{row('Location', selected.location)}{row('Driving option', 'Self drive')}</View>
              <View style={styles.group}>{row('Daily rate', money(selected.vehicle.pricePerDayXaf))}{row('Rental total', money(selected.vehicle.pricePerDayXaf * selected.days))}{row('Payment', selected.payment)}{row('Refundable deposit', money(selected.vehicle.rentalTerms?.depositXaf ?? 0))}</View>
              <Text style={styles.note}>The refundable deposit is separate from the rental total.</Text>
              {selected.status === 'Confirmed' && <Text style={styles.note}>Confirm pickup arrangements with the renter before the rental begins.</Text>}
              {selected.status === 'In progress' && <Text style={styles.note}>Review the return date and coordinate the handover with the renter.</Text>}
            </ScrollView>
            {confirmDecline ? <View style={styles.actionArea}><Text style={styles.confirmText}>Decline this booking request?</Text><View style={styles.actions}><Pressable accessibilityRole="button" style={styles.secondary} onPress={() => setConfirmDecline(false)}><Text style={styles.secondaryText}>Keep request</Text></Pressable><Pressable accessibilityRole="button" style={[styles.primary, styles.decline]} onPress={() => { onStatusChange(selected.id, 'Declined'); setConfirmDecline(false); }}><Text style={styles.primaryText}>Decline</Text></Pressable></View></View> : selected.status === 'Requested' ? <View style={styles.actionArea}><View style={styles.actions}><Pressable accessibilityRole="button" style={styles.secondary} onPress={() => setConfirmDecline(true)}><Text style={styles.secondaryText}>Decline</Text></Pressable><Pressable accessibilityRole="button" style={styles.primary} onPress={() => onStatusChange(selected.id, 'Confirmed')}><Text style={styles.primaryText}>Accept request</Text></Pressable></View><Pressable accessibilityRole="button" style={styles.messageLink} onPress={() => { close(); onMessage(selected.conversationId); }}><Text style={styles.link}>Message renter</Text></Pressable></View> : <View style={styles.actions}><Pressable accessibilityRole="button" style={styles.secondary} onPress={close}><Text style={styles.secondaryText}>Done</Text></Pressable><Pressable accessibilityRole="button" style={styles.primary} onPress={() => { close(); onMessage(selected.conversationId); }}><Text style={styles.primaryText}>Message renter</Text></Pressable></View>}
          </>}
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundLight }, flex: { flex: 1 }, header: { paddingHorizontal: layout.screenGutter, paddingTop: 20, paddingBottom: 12 }, title: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 28, color: colors.textPrimary }, subtitle: { fontSize: 15, lineHeight: 23, color: colors.textSecondary, marginTop: 7 },
  filters: { gap: 8, paddingHorizontal: layout.screenGutter, paddingVertical: 14 }, filter: { backgroundColor: colors.white, borderRadius: 24, paddingHorizontal: 15, paddingVertical: 12 }, activeFilter: { backgroundColor: colors.primaryBrandBlue }, filterText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary }, white: { color: colors.white }, list: { paddingHorizontal: layout.screenGutter, paddingTop: 12 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 16, marginBottom: 18, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, carImage: { width: 88, height: 76 }, cardCopy: { flex: 1, gap: 5 }, carName: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 16, lineHeight: 23, color: colors.textPrimary }, renter: { fontSize: 14, color: colors.textPrimary }, dates: { fontSize: 13, lineHeight: 20, color: colors.textSecondary }, cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 14 }, badge: { fontSize: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, overflow: 'hidden', ...statusText }, amount: { fontSize: 15, color: colors.textPrimary,  ...moneyText }, pressed: { opacity: 0.75 },
  empty: { alignItems: 'center', paddingHorizontal: 25, paddingVertical: 60 }, emptyIcon: { padding: 20, backgroundColor: '#EDF2FF', borderRadius: 28 }, emptyTitle: { fontSize: 19, fontWeight: '600', marginTop: 18, color: colors.textPrimary },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.4)' }, sheet: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22 }, handleArea: { height: 30, alignItems: 'center', justifyContent: 'center' }, handle: { width: 40, height: 5, backgroundColor: colors.borderGray, borderRadius: 3 }, sheetHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, sheetTitle: { fontSize: 21, fontWeight: '700', color: colors.textPrimary }, close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' }, sheetContent: { paddingBottom: 12 }, bookingHero: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 }, muted: { fontSize: 14, lineHeight: 21, color: colors.textSecondary }, statusPanel: { backgroundColor: '#F5F6F8', borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, group: { backgroundColor: '#F5F6F8', borderRadius: 15, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 12 }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingVertical: 8 }, detailValue: { flex: 1, textAlign: 'right', color: colors.textPrimary, fontSize: 14, lineHeight: 21, fontWeight: '500' }, note: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginBottom: 8 },
  actionArea: { paddingTop: 4 }, actions: { flexDirection: 'row', gap: 10, paddingTop: 8 }, primary: { flex: 1, minHeight: 50, borderRadius: 26, backgroundColor: colors.primaryBrandBlue, justifyContent: 'center', alignItems: 'center', padding: 12 }, secondary: { flex: 1, minHeight: 50, borderRadius: 26, backgroundColor: colors.surfaceGray, justifyContent: 'center', alignItems: 'center', padding: 12 }, primaryText: { color: colors.white, fontSize: 14, fontWeight: '600', textAlign: 'center' }, secondaryText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', textAlign: 'center' }, decline: { backgroundColor: '#AD4242' }, confirmText: { fontSize: 15, fontWeight: '500', color: colors.textPrimary, marginVertical: 8 }, messageLink: { alignItems: 'center', padding: 14 }, link: { color: colors.primaryBrandBlue, fontSize: 14, fontWeight: '600' },
});

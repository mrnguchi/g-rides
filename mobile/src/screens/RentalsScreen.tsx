import { MaintenanceDetailsSheet } from '../components/MaintenanceDetailsSheet';
import { useMaintenanceFlow, maintenanceStatusLabels, type MaintenanceBooking } from '../components/MaintenanceFlowProvider';
import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, SectionList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeBottomNavigation } from '../components';
import { AppIcon } from '../components/AppIcon';
import { BookingRequestSheet } from '../components/BookingRequestSheet';
import { MOCK_ACTIVE_RENTAL, MOCK_RENTAL_HISTORY, MOCK_UPCOMING_RENTALS } from '../constants/mockRentals';
import { colors, fonts, layout } from '../theme';
import type { MainTab } from '../types/navigation';
import type { RentalRecord } from '../types/rental';
import type { BookingRequest } from '../types/booking';
import type { Vehicle } from '../types/map';
import { activityDateKey, parseActivityDate } from '../utils/activityDates';

type ActivityScreenProps = {
  requests?: BookingRequest[];
  onCancelRequest?: (id: string) => void;
  onMessageOwner?: () => void;
  onOpenRental?: (rental: RentalRecord) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};
const serviceTabs = ['All', 'Rentals', 'Maintenance', 'Parts', 'Towing', 'Insurance'] as const;
const statusTabs = ['Ongoing', 'Upcoming', 'History'] as const;
const dateAccents = [colors.primaryBrandBlue, colors.orange, colors.primaryDark] as const;
type StatusTab = typeof statusTabs[number];
type ActivityItem = {
  id: string; date: string; vehicle: Vehicle; status: string; group: StatusTab;
  reference: string; detail: string; maintenance?: MaintenanceBooking; rental?: RentalRecord; request?: BookingRequest;
};
function rentalItem(rental: RentalRecord): ActivityItem {
  return {
    id: rental.id, vehicle: rental.vehicle, reference: rental.bookingReference, rental,
    date: rental.status === 'confirmed' ? rental.startDate : rental.endDate,
    group: rental.status === 'active' ? 'Ongoing' : rental.status === 'confirmed' ? 'Upcoming' : 'History',
    status: { active: 'Rental in progress', confirmed: 'Confirmed', completed: 'Completed', canceled: 'Canceled' }[rental.status],
    detail: `${rental.startDate} – ${rental.endDate}`,
  };
}

export function ActivityScreen({ requests = [], onCancelRequest, onMessageOwner, onOpenRental, onTabPress, unreadMessagesCount = 0 }: ActivityScreenProps) {
  const insets = useSafeAreaInsets();
  const { requests: maintenanceRequests } = useMaintenanceFlow();
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<string>();
  const selectedMaintenance = maintenanceRequests.find(request => request.id === selectedMaintenanceId);
  const [service, setService] = useState<typeof serviceTabs[number]>('All');
  const [status, setStatus] = useState<StatusTab>('Ongoing');
  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const selectedRequest = requests.find((request) => request.id === selectedRequestId);
  const items = useMemo<ActivityItem[]>(() => [
    ...maintenanceRequests.map((request): ActivityItem => ({
      id: request.id, vehicle: request.rental.vehicle, reference: request.reference, maintenance: request,
      date: request.status === 'confirmed' && request.quote ? request.quote.visitAt : request.startedAt ?? request.decidedAt ?? request.createdAt,
      group: request.status === 'confirmed' ? 'Upcoming' : request.status === 'quote_declined' ? 'History' : 'Ongoing', status: maintenanceStatusLabels[request.status],
      detail: request.garage.name + ((request.status === 'confirmed' || request.status === 'in_progress') && request.quote ? ' · Visit: ' + new Date(request.quote.visitAt).toLocaleDateString('en-GB') : ' · Preferred visit: ' + new Date(request.preferredDate + 'T12:00:00').toLocaleDateString('en-GB')),
    })),
    ...requests.map((request): ActivityItem => ({
      id: request.id, vehicle: request.vehicle, reference: request.bookingReference, request,
      date: request.createdAt,
      group: request.status === 'pending' ? 'Ongoing' : 'History',
      status: request.status === 'pending' ? 'Awaiting approval' : 'Canceled',
      detail: `${request.startDate} – ${request.endDate}`,
    })),
    ...[MOCK_ACTIVE_RENTAL, ...MOCK_UPCOMING_RENTALS, ...MOCK_RENTAL_HISTORY].map(rentalItem),
  ], [requests, maintenanceRequests]);
  const serviceItems = service === 'All' ? items : service === 'Rentals' ? items.filter(item => !item.maintenance) : service === 'Maintenance' ? items.filter(item => !!item.maintenance) : [];
  const visibleItems = serviceItems.filter((item) => item.group === status);
  const sections = useMemo(() => {
    const groups = new Map<string, ActivityItem[]>();
    for (const item of visibleItems) {
      const key = activityDateKey(item.date);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups].sort(([first], [second]) => first === 'undated' ? 1 : second === 'undated' ? -1 : status === 'Upcoming' ? first.localeCompare(second) : second.localeCompare(first))
      .map(([key, data], index) => ({ key, data, date: parseActivityDate(key), accent: dateAccents[index % dateAccents.length] }));
  }, [visibleItems, status]);
  const openItem = (item: ActivityItem) => {
    if (item.maintenance) setSelectedMaintenanceId(item.maintenance.id);
    else if (item.request) setSelectedRequestId(item.request.id);
    else if (item.rental) onOpenRental?.(item.rental);
  };
  return <View style={styles.screen}>
    <StatusBar style="light" />
    <SafeAreaView edges={['top']} style={styles.header}>
      <Text style={styles.title}>Activity</Text>
      <Text style={styles.subtitle}>Your bookings & services</Text>
    </SafeAreaView>
    <View style={styles.sheet}>
      <View style={styles.serviceTabs}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceContent}>
        {serviceTabs.map((tab) => <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: service === tab }} onPress={() => setService(tab)} style={[styles.serviceChip, service === tab && styles.serviceSelected]}><Text style={[styles.serviceLabel, service === tab && styles.whiteText]}>{tab}</Text></Pressable>)}
      </ScrollView></View>
      <View style={styles.statusTabs}>{statusTabs.map((tab) => <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: status === tab }} onPress={() => setStatus(tab)} style={[styles.statusTab, status === tab && styles.statusSelected]}><Text style={[styles.statusLabel, status === tab && styles.statusSelectedLabel]}>{tab}</Text><Text style={[styles.count, status === tab && styles.statusSelectedLabel]}>{serviceItems.filter((item) => item.group === tab).length}</Text></Pressable>)}</View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: 120 + insets.bottom }]}
        ListHeaderComponent={<>
          {visibleItems.length > 0 && <View style={styles.listHeading}><Text style={styles.sectionTitle}>{status === 'History' ? 'Past activity' : status === 'Upcoming' ? 'Coming up' : 'In progress & requests'}</Text><Text style={styles.muted}>{visibleItems.length} {visibleItems.length === 1 ? 'activity' : 'activities'}</Text></View>}
        </>}
        ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><AppIcon name="activity" color={colors.primaryBrandBlue} size={28} /></View><Text style={styles.emptyTitle}>No {status.toLowerCase()} {service === 'All' ? 'activity' : service.toLowerCase()}</Text><Text style={styles.emptyCopy}>{status === 'History' ? 'Completed and canceled bookings will appear here.' : 'Your bookings and requests will appear here as you use G-Rides.'}</Text><Pressable accessibilityRole="button" onPress={() => onTabPress?.('discover')} style={styles.browseButton}><Text style={styles.browseText}>Explore Discover</Text></Pressable></View>}
        renderSectionHeader={({ section }) => <View style={styles.dateHeader}>{section.date ? <><View style={[styles.dateBadge, { backgroundColor: `${section.accent}12` }]}><Text style={[styles.dateDay, { color: section.accent }]}>{section.date.getDate()}</Text><Text style={[styles.dateMonth, { color: section.accent }]}>{section.date.toLocaleDateString('en-GB', { month: 'short' })}</Text></View><View><Text style={styles.dateWeekday}>{section.date.toLocaleDateString('en-GB', { weekday: 'long' })}</Text><Text style={styles.dateYear}>{section.date.getFullYear()}</Text></View></> : <Text style={styles.dateWeekday}>Date to be confirmed</Text>}<View style={styles.dateLine} /></View>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.vehicle.brand} ${item.vehicle.model}, ${item.status}. View details`} onPress={() => openItem(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.cardTop}><Image source={item.vehicle.image} resizeMode="contain" style={styles.carImage} /><View style={styles.cardCopy}><Text style={styles.cardName}>{item.vehicle.brand} {item.vehicle.model}</Text><Text style={styles.reference}>{item.maintenance ? 'Maintenance' : 'Rental'} · {item.reference}</Text></View><View style={styles.chevron}><AppIcon name="chevronRight" color={colors.primaryBrandBlue} size={18} /></View></View>
          <Text style={styles.dates}>{item.detail}</Text>
          <View style={styles.cardBottom}><View style={[styles.badge, item.status === 'Canceled' && styles.canceledBadge]}><View style={[styles.statusDot, item.status === 'Canceled' && styles.canceledDot]} /><Text style={[styles.badgeText, item.maintenance && { fontFamily: fonts.regular }, item.status === 'Canceled' && styles.muted]}>{item.status}</Text></View><Text style={styles.cardAction}>{item.maintenance?.status === 'quoted' ? 'Review quote' : item.maintenance?.status === 'in_progress' ? 'Track service' : item.request?.status === 'pending' ? 'Follow request' : 'View details'}</Text></View>
        </Pressable>}
      />
    </View>
    {selectedMaintenance && <MaintenanceDetailsSheet key={selectedMaintenance.id} request={selectedMaintenance} onClose={() => setSelectedMaintenanceId(undefined)} />}
    <HomeBottomNavigation activeTab="activity" onTabPress={onTabPress} unreadMessagesCount={unreadMessagesCount} />
    {selectedRequest?.status === 'pending' && <BookingRequestSheet existingRequest={selectedRequest} vehicle={selectedRequest.vehicle} visible onClose={() => setSelectedRequestId(undefined)} onRequestCanceled={(id) => { onCancelRequest?.(id); setSelectedRequestId(undefined); }} onMessageOwner={onMessageOwner} onOpenActivity={() => setSelectedRequestId(undefined)} />}
    <Modal transparent visible={selectedRequest?.status === 'canceled'} animationType="slide" onRequestClose={() => setSelectedRequestId(undefined)}><View style={styles.modalRoot}><Pressable accessibilityLabel="Close request details" accessibilityRole="button" onPress={() => setSelectedRequestId(undefined)} style={styles.backdrop} /><View style={[styles.requestSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}><Text style={styles.sectionTitle}>Canceled request</Text><Text style={styles.cardName}>{selectedRequest?.vehicle.brand} {selectedRequest?.vehicle.model}</Text><Text style={styles.dates}>{selectedRequest?.startDate} – {selectedRequest?.endDate}</Text><Text style={styles.reference}>Reference: {selectedRequest?.bookingReference}</Text><Text style={styles.dates}>{selectedRequest?.handoverAddress}</Text><Pressable accessibilityRole="button" onPress={() => setSelectedRequestId(undefined)} style={styles.browseButton}><Text style={styles.browseText}>Close</Text></Pressable></View></View></Modal>
  </View>;
}
export const RentalsScreen = ActivityScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark },
  header: { paddingHorizontal: layout.screenGutter, paddingTop: 22, paddingBottom: 26 },
  title: { fontFamily: fonts.bold, color: colors.white, fontSize: 30 },
  subtitle: { fontFamily: fonts.regular, color: '#CBD5E1', fontSize: 14, marginTop: 7 },
  sheet: { flex: 1, backgroundColor: colors.backgroundLight, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 20 },
  serviceTabs: { marginBottom: 16 },
  serviceContent: { paddingHorizontal: layout.screenGutter, gap: 8 },
  serviceChip: { backgroundColor: colors.white, borderRadius: 22, paddingHorizontal: 16, minHeight: 42, justifyContent: 'center' },
  serviceSelected: { backgroundColor: colors.primaryBrandBlue },
  serviceLabel: { fontFamily: fonts.medium, color: colors.textSecondary, fontSize: 13 },
  whiteText: { color: colors.white },
  statusTabs: { flexDirection: 'row', backgroundColor: '#EDF0F5', borderRadius: 16, padding: 4, marginHorizontal: layout.screenGutter, marginBottom: 8 },
  statusTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 42, borderRadius: 12 },
  statusSelected: { backgroundColor: colors.white },
  statusLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  statusSelectedLabel: { color: colors.primaryBrandBlue },
  count: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  list: { paddingHorizontal: layout.screenGutter, paddingTop: 12 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.textPrimary },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 5 },
  muted: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
  dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 17, marginBottom: 12 },
  dateBadge: { width: 45, height: 50, backgroundColor: '#EDF4FE', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dateDay: { fontFamily: fonts.bold, fontSize: 20, color: colors.primaryBrandBlue },
  dateMonth: { fontFamily: fonts.medium, fontSize: 12, color: colors.primaryBrandBlue },
  dateWeekday: { fontFamily: fonts.medium, fontSize: 13, color: colors.textPrimary },
  dateYear: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  dateLine: { height: 1, backgroundColor: colors.borderGray, flex: 1, marginLeft: 6 },
  card: { backgroundColor: colors.white, borderRadius: 19, padding: 15, marginBottom: 13, borderWidth: 1, borderColor: '#E9EDF3', shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.035, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  carImage: { width: 76, height: 56 },
  cardCopy: { flex: 1 },
  cardName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  reference: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  chevron: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#EDF4FE', justifyContent: 'center', alignItems: 'center' },
  dates: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 11 },
  cardBottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EDF4FE', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primaryBrandBlue },
  badgeText: { fontFamily: fonts.medium, color: colors.primaryBrandBlue, fontSize: 12 },
  canceledBadge: { backgroundColor: colors.surfaceGray },
  canceledDot: { backgroundColor: colors.textSecondary },
  cardAction: { fontFamily: fonts.medium, color: colors.primaryBrandBlue, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 42, gap: 14 },
  emptyIcon: { width: 64, height: 64, borderRadius: 22, backgroundColor: '#EDF4FE', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 17, textAlign: 'center' },
  emptyCopy: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, lineHeight: 21, textAlign: 'center', maxWidth: 260 },
  browseButton: { minHeight: 44, borderRadius: 22, paddingHorizontal: 23, backgroundColor: '#EDF4FE', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  browseText: { fontFamily: fonts.medium, color: colors.primaryBrandBlue, fontSize: 13 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.4)' },
  requestSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.white, padding: 24, gap: 12 },
  pressed: { opacity: 0.75 },
});

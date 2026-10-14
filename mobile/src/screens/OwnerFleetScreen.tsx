import { useEffect, useState, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { MOCK_HOME_VEHICLES } from '../constants/mockVehicles';
import { colors, fonts, layout, moneyText, statusText } from '../theme';
import type { UserVehicle } from '../types/vehicle';
import type { FleetEdits, FleetItem, FleetStatus } from '../types/fleet';

const filters = ['All', 'Available', 'Rented', 'Maintenance'] as const;
// Sample operational states; customer listing availability is not modified.
const sampleStates: FleetStatus[] = ['Available', 'Rented', 'Maintenance', 'Available'];
const sampleBookings = [18, 12, 9, 15];
const sampleEarnings = [450000, 324000, 252000, 675000];
const sampleFleet: FleetItem[] = MOCK_HOME_VEHICLES.map((car, index) => ({
  id: car.id, name: `${car.brand} ${car.model.replace(/\s*\b(19|20)\d{2}\b/, '')}`, year: car.model.match(/\b(19|20)\d{2}\b/)?.[0], image: car.image,
  dailyRate: car.pricePerDayXaf, transmission: car.transmission ?? 'Not specified', category: car.category === 'SUVs' ? 'SUV' : car.category === 'Sedans' ? 'Sedan' : car.category,
  seats: car.seats, rating: car.rating, status: sampleStates[index], bookings: sampleBookings[index], earnings: sampleEarnings[index],
  description: car.description, fuelType: car.fuelType, airConditioning: car.airConditioning,
}));
const money = (amount: number) => amount.toLocaleString('en-US');

export function OwnerFleetScreen({ navigation, onAddVehicle, savedVehicles, edits, onOpenVehicle }: { navigation: ReactNode; onAddVehicle: () => void; savedVehicles: UserVehicle[]; edits: Record<string, FleetEdits>; onOpenVehicle: (car: FleetItem) => void }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<typeof filters[number]>('All');
  useEffect(() => { setQuery(''); setFilter('All'); }, [savedVehicles.length]);
  const items: FleetItem[] = [...savedVehicles.map(car => ({
    id: car.id, name: `${car.make} ${car.model}`, year: String(car.year), image: car.image, transmission: car.transmission === 'unknown' ? 'Not specified' : car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1), category: car.category,
    status: 'Pending verification' as const, bookings: 0, earnings: 0, registration: car.registrationNumber,
    documents: car.documents, ownerPhotos: car.ownerPhotos?.map(photo => ({ uri: photo.uri })), fuelType: car.fuelType === 'unknown' ? undefined : car.fuelType.charAt(0).toUpperCase() + car.fuelType.slice(1),
  })), ...sampleFleet];
  const matching = items.map(car => ({ ...car, ...edits[car.id] })).filter(car => `${car.name} ${car.year ?? ''} ${car.registration ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = matching.filter(car => filter === 'All' || car.status === filter);
  const statusStyle = (status: FleetStatus) => status === 'Available' ? styles.available : status === 'Rented' ? styles.rented : styles.maintenance;
  return <View style={styles.screen}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerCopy}><Text style={styles.title}>My fleet</Text><Text style={styles.subtitle}>Your vehicles, all in one place.</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add vehicle" onPress={onAddVehicle} style={styles.addButton}><AppIcon name="plus" size={25} color={colors.white} /></Pressable>
      </View>
      <View style={styles.search}><AppIcon name="discover" size={21} color={colors.textSecondary} /><TextInput accessibilityLabel="Search fleet" value={query} onChangeText={setQuery} placeholder="Search cars or registration" placeholderTextColor={colors.textSecondary} style={styles.input} returnKeyType="search" autoCorrect={false} /><View>{query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={12}><AppIcon name="close" size={19} /></Pressable>}</View></View>
      <View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.selectedFilter]}><Text style={[styles.filterText, filter === value && styles.white]}>{value}  {matching.filter(car => value === 'All' || car.status === value).length}</Text></Pressable>)}</ScrollView></View>
      <FlatList data={visible} keyExtractor={car => car.id} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.list, { paddingBottom: 120 + insets.bottom }]}
        ListHeaderComponent={<Text style={styles.resultCount}>{visible.length} {visible.length === 1 ? 'vehicle' : 'vehicles'}</Text>}
        ListEmptyComponent={<View style={styles.empty}><AppIcon name="fleet" size={38} color={colors.primaryBrandBlue} /><Text style={styles.emptyTitle}>No vehicles found</Text><Text style={styles.subtitle}>Try another search or availability filter.</Text><Pressable accessibilityRole="button" onPress={() => { setQuery(''); setFilter('All'); }} style={styles.reset}><Text style={styles.link}>Show all vehicles</Text></Pressable></View>}
        renderItem={({ item: car }) => <Pressable accessibilityRole="button" accessibilityLabel={`${car.name}, ${car.status}. View vehicle details`} onPress={() => onOpenVehicle(car)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.cardTop}><View style={styles.carIdentity}><Text style={styles.carName}>{car.name}</Text>{car.year && <Text style={styles.year}>{car.year}</Text>}</View><View style={styles.priceBlock}><Text style={styles.price}>{car.dailyRate === undefined ? 'Not set' : `${money(car.dailyRate)} XAF`}</Text><Text style={styles.perDay}>per day</Text></View></View>
          <View style={styles.statusRow}><Text style={[styles.badge, statusStyle(car.status)]}>{car.status}</Text></View>
          {car.image ? <Image source={car.image} resizeMode="contain" style={styles.carImage} /> : <View style={[styles.carImage, styles.imagePlaceholder]}><AppIcon name="vehicle" size={58} color={colors.textSecondary} /><Text style={styles.subtitle}>Vehicle photo pending</Text></View>}
          <View style={styles.ownerStats}><Text style={styles.statLabel}><Text style={styles.statValue}>{car.bookings}</Text> bookings</Text><Text style={styles.statLabel}>Earnings <Text style={[styles.statValue, moneyText]}>{money(car.earnings)} XAF</Text></Text></View>
          <View style={styles.cardBottom}><View style={styles.specs}>{[['Transmission', car.transmission], ['Type', car.category], ['Seats', car.seats?.toString() ?? '—'], ['Rating', car.rating?.toFixed(1) ?? '—']].map(([label, value], index) => <View key={label} style={[styles.spec, index === 0 && styles.transmissionSpec, index > 0 && styles.specDivider]}><Text numberOfLines={1} style={styles.specLabel}>{label}</Text><Text numberOfLines={1} style={styles.specValue}>{value}</Text></View>)}</View><View style={styles.arrow}><AppIcon name="arrowUpRight" size={24} color={colors.white} strokeWidth={1.5} /></View></View>
        </Pressable>}
      />
    </SafeAreaView>
    {navigation}
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundLight }, safeArea: { flex: 1 }, header: { paddingHorizontal: layout.screenGutter, paddingTop: 20, paddingBottom: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }, headerCopy: { flex: 1 },
  title: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 28, color: colors.textPrimary }, subtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 5 }, addButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primaryBrandBlue, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: layout.screenGutter, backgroundColor: colors.white, borderRadius: 16, minHeight: 50, paddingHorizontal: 14 }, input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary },
  filters: { paddingHorizontal: layout.screenGutter, paddingVertical: 18, gap: 8 }, filter: { minHeight: 42, borderRadius: 22, backgroundColor: colors.white, justifyContent: 'center', paddingHorizontal: 15 }, selectedFilter: { backgroundColor: colors.primaryBrandBlue }, filterText: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 13, color: colors.textSecondary }, white: { color: colors.white },
  list: { paddingHorizontal: layout.screenGutter }, resultCount: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginBottom: 14 },
  card: { backgroundColor: '#F3F4F6', borderRadius: 22, marginBottom: 16, paddingTop: 18 }, cardTop: { paddingHorizontal: 18, flexDirection: 'row', gap: 12, justifyContent: 'space-between' }, carIdentity: { flex: 1 }, carName: { fontFamily: fonts.semiBold, fontWeight: '600', color: colors.textPrimary, fontSize: 17 }, year: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 5 }, priceBlock: { alignItems: 'flex-end' }, price: { color: colors.textPrimary, fontSize: 15,  ...moneyText }, perDay: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  statusRow: { marginHorizontal: 18, marginTop: 12, alignItems: 'flex-start' }, badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, fontSize: 11, ...statusText }, available: { backgroundColor: '#EAF7EF', color: '#287E48' }, rented: { backgroundColor: '#E5EDFC', color: colors.primaryBrandBlue }, maintenance: { backgroundColor: '#FFF5DF', color: '#8A5A00' },
  carImage: { width: '100%', height: 172, marginVertical: 8 }, imagePlaceholder: { alignItems: 'center', justifyContent: 'center' }, ownerStats: { marginHorizontal: 18, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }, statLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary }, statValue: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 13, color: colors.textPrimary },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end' }, specs: { flex: 1, flexDirection: 'row', paddingLeft: 12, paddingBottom: 18 }, spec: { flex: 1, paddingHorizontal: 5 }, transmissionSpec: { flex: 1.8 }, specDivider: { borderLeftWidth: 1, borderLeftColor: colors.borderGray }, specLabel: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 11, marginBottom: 7 }, specValue: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 13 }, arrow: { width: 46, height: 52, marginLeft: 5, borderTopLeftRadius: 17, borderBottomRightRadius: 22, backgroundColor: colors.primaryBrandBlue, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 }, empty: { alignItems: 'center', paddingVertical: 40, gap: 12 }, emptyTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary }, reset: { minHeight: 44, justifyContent: 'center' }, link: { fontFamily: fonts.medium, fontSize: 14, color: colors.primaryBrandBlue },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.45)' }, panel: { maxHeight: '80%', backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 }, panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, panelTitle: { fontFamily: fonts.semiBold, fontSize: 21, color: colors.textPrimary }, close: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' }, overviewBadge: { alignSelf: 'flex-start', borderRadius: 10, padding: 8, marginTop: 12, fontSize: 12, ...statusText }, overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderGray }, overviewNote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 18 },
});

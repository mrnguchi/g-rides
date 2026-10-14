import { CarSearchBar } from '../components/CarSearchBar';
import { MaintenanceListings } from '../components/MaintenanceListings';
import { ListingCarCard } from '../components/ListingCarCard';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { RentalFaqSection } from '../components/RentalFaqSection';
import { HomeBottomNavigation } from '../components';
import { BONASSAMA_COORDINATE, MOCK_HOME_VEHICLES } from '../constants/mockVehicles';
import { colors, fonts, layout, moneyText } from '../theme';
import type { Coordinate, Vehicle } from '../types/map';
import type { DiscoverCategory, MainTab } from '../types/navigation';

type DiscoverScreenProps = {
  category?: DiscoverCategory;
  onCategoryChange?: (category: DiscoverCategory) => void;
  onOpenVehicle?: (vehicle: Vehicle, userLocation: Coordinate) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};
const categories: DiscoverCategory[] = ['Cars', 'Maintenance', 'Parts', 'Towing', 'Insurance'];
const CARS_PER_PAGE = 4;
const vehicleTypes = ['All types', 'Sedans', 'SUVs', 'Luxury'] as const;
const priceOptions = ['Any price', 'Under 30,000 XAF', '30,000 XAF and above'] as const;
const brandOptions = ['All brands', ...new Set(MOCK_HOME_VEHICLES.map((vehicle) => vehicle.brand))];
const serviceDescriptions = {
  Maintenance: 'Book care and servicing for your vehicle.',
  Parts: 'Find parts that fit your vehicle.',
  Towing: 'Request towing and roadside assistance.',
  Insurance: 'Explore cover for your vehicle.',
};

export function DiscoverScreen({ category = 'Cars', onCategoryChange, onOpenVehicle, onTabPress, unreadMessagesCount = 0 }: DiscoverScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [brand, setBrand] = useState('All brands');
  const [vehicleType, setVehicleType] = useState<string>('All types');
  const [price, setPrice] = useState<string>('Any price');
  const [sortByPrice, setSortByPrice] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CARS_PER_PAGE);
  useEffect(() => {
    setVisibleCount(CARS_PER_PAGE);
  }, [query, brand, vehicleType, price, sortByPrice]);
  const filterCount = Number(brand !== 'All brands') + Number(vehicleType !== 'All types') + Number(price !== 'Any price');
  const cars = useMemo(() => {
    const result = MOCK_HOME_VEHICLES.filter((vehicle) => vehicle.available
      && `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(query.trim().toLowerCase())
      && (brand === 'All brands' || brand === vehicle.brand)
      && (vehicleType === 'All types' || vehicleType === vehicle.category)
      && (price === 'Any price' || (price === 'Under 30,000 XAF' ? vehicle.pricePerDayXaf < 30000 : vehicle.pricePerDayXaf >= 30000)));
    return sortByPrice ? result.sort((a, b) => a.pricePerDayXaf - b.pricePerDayXaf) : result;
  }, [brand, price, query, sortByPrice, vehicleType]);
  const clearFilters = () => { setQuery(''); setBrand('All brands'); setVehicleType('All types'); setPrice('Any price'); setSortByPrice(false); };
  const chips = (options: readonly string[], value: string, select: (value: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
      {options.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: option === value }} onPress={() => select(option)} style={[styles.chip, option === value && styles.selectedChip]}><Text style={[styles.chipText, option === value && styles.selectedChipText]}>{option}</Text></Pressable>)}
    </ScrollView>
  );
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.header}><Text style={styles.title}>Discover</Text><Text style={styles.subtitle}>{category === 'Cars' ? 'Find the right car for your next journey.' : category === 'Maintenance' ? 'Find the right care for your vehicle.' : serviceDescriptions[category]}</Text></SafeAreaView>
      <View style={styles.sheet}>
        <View style={styles.tabContainer}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {categories.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: item === category }} onPress={() => onCategoryChange?.(item)} style={[styles.tab, item === category && styles.activeTab]}><Text style={[styles.tabText, item === category && styles.activeTabText]}>{item}</Text></Pressable>)}
        </ScrollView></View>
        {category === 'Cars' ? <>
          <View style={{ marginHorizontal: layout.screenGutter }}><CarSearchBar value={query} onChangeText={setQuery} onFilterPress={() => setShowFilters(!showFilters)} filtersExpanded={showFilters} filterCount={filterCount} /></View>
          <FlatList
            data={cars.slice(0, visibleCount)}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.list, { paddingBottom: 110 + insets.bottom }]}
            ListHeaderComponent={<>
              {showFilters && <View style={styles.filters}>
                <Text style={styles.filterLabel}>Brand</Text>{chips(brandOptions, brand, setBrand)}
                <Text style={styles.filterLabel}>Vehicle type</Text>{chips(vehicleTypes, vehicleType, setVehicleType)}
                <Text style={styles.filterLabel}>Daily price</Text>{chips(priceOptions, price, setPrice)}
                <Pressable onPress={clearFilters}><Text style={styles.link}>Reset filters</Text></Pressable>
              </View>}
              <View style={styles.resultsHeader}><View><Text style={styles.sectionTitle}>Available Cars</Text><Text style={styles.resultCount}>{cars.length} {cars.length === 1 ? 'car' : 'cars'} to explore</Text></View><Pressable accessibilityRole="button" onPress={() => setSortByPrice(!sortByPrice)}><Text style={styles.link}>{sortByPrice ? 'Price: low to high' : 'Recommended'}</Text></Pressable></View>
            </>}
            ListEmptyComponent={<View style={styles.empty}><AppIcon name="vehicle" size={36} color={colors.textSecondary} /><Text style={styles.sectionTitle}>No cars found</Text><Text style={styles.helper}>Try another search or adjust your filters.</Text><Pressable onPress={clearFilters}><Text style={styles.link}>Show all cars</Text></Pressable></View>}
            ListFooterComponent={<>{visibleCount < cars.length ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View ${Math.min(CARS_PER_PAGE, cars.length - visibleCount)} more cars`}
                onPress={() => setVisibleCount((count) => Math.min(count + CARS_PER_PAGE, cars.length))}
                style={({ pressed }) => [styles.viewMore, pressed && styles.pressed]}
              >
                <Text style={styles.viewMoreText}>View more</Text>
              </Pressable>
            ) : null}<RentalFaqSection /></>}
            renderItem={({ item: vehicle }) => <ListingCarCard vehicle={vehicle} onPress={() => onOpenVehicle?.(vehicle, BONASSAMA_COORDINATE)} />}
          />
        </> : category === 'Maintenance' ? <MaintenanceListings /> : <View style={styles.empty}><Text style={styles.sectionTitle}>{category}</Text><Text style={styles.helper}>{serviceDescriptions[category]}</Text><Text style={styles.helper}>Coming soon</Text></View>}
      </View>
      <HomeBottomNavigation activeTab="discover" onTabPress={onTabPress} unreadMessagesCount={unreadMessagesCount} />
    </View>
  );
}

export const ExploreScreen = DiscoverScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark },
  header: { paddingHorizontal: layout.screenGutter, paddingTop: 22, paddingBottom: 26 },
  title: { color: colors.white, fontFamily: fonts.bold, fontSize: 30 },
  subtitle: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 14, marginTop: 7 },
  sheet: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 20 },
  tabContainer: { marginBottom: 18 },
  tabs: { paddingHorizontal: layout.screenGutter, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, backgroundColor: colors.backgroundLight },
  activeTab: { backgroundColor: colors.primaryBrandBlue },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  activeTabText: { color: colors.white },
  searchRow: { flexDirection: 'row', gap: 10, marginHorizontal: layout.screenGutter, marginBottom: 8 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.backgroundLight, height: 50 },
  input: { flex: 1, fontFamily: fonts.regular, color: colors.textPrimary, fontSize: 15 },
  filterButton: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceGray },
  filterIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: colors.primaryDark },
  filterDot: { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryBrandBlue },
  list: { paddingHorizontal: layout.screenGutter },
  filters: { paddingVertical: 12, gap: 10 },
  filterLabel: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 13 },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16, backgroundColor: colors.backgroundLight },
  selectedChip: { backgroundColor: '#EDF4FE' },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  selectedChipText: { color: colors.primaryBrandBlue },
  link: { fontFamily: fonts.medium, color: colors.primaryBrandBlue, fontSize: 13 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 21 },
  resultCount: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  viewMore: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 28, borderRadius: 22, backgroundColor: '#EDF4FE', marginTop: 4, marginBottom: 12 },
  viewMoreText: { color: colors.primaryBrandBlue, fontFamily: fonts.semiBold, fontSize: 14 },
  card: { backgroundColor: '#F3F4F6', borderRadius: 22, marginBottom: 16, paddingTop: 18 },
  cardTop: { paddingHorizontal: 18, flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  carIdentity: { flex: 1 },
  carName: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 17 },
  year: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 5 },
  priceBlock: { alignItems: 'flex-end' },
  price: { color: colors.textPrimary, fontSize: 15,  ...moneyText },
  perDay: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  carImage: { width: '100%', height: 172, marginVertical: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end' },
  specs: { flex: 1, flexDirection: 'row', paddingLeft: 12, paddingBottom: 18 },
  spec: { flex: 1, paddingHorizontal: 5 },
  transmissionSpec: { flex: 1.8 }, specDivider: { borderLeftWidth: 1, borderLeftColor: colors.borderGray },
  specLabel: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 11, marginBottom: 7 },
  specValue: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 13 },
  arrow: { width: 46, height: 52, marginLeft: 5, borderTopLeftRadius: 17, borderBottomRightRadius: 22, backgroundColor: colors.primaryBrandBlue, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingHorizontal: layout.screenGutter, paddingVertical: 36, alignItems: 'center', gap: 14 },
  helper: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  pressed: { opacity: 0.75 },
});

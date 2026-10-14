import { CarSearchBar } from '../components/CarSearchBar';
import { ListingCarCard } from '../components/ListingCarCard';
import { AppIcon } from '../components/AppIcon';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HomeBottomNavigation,
  NotificationSheet,
} from '../components';
import type { MainTab } from '../components';
import {
  BONASSAMA_COORDINATE,
  MOCK_HOME_VEHICLES,
} from '../constants/mockVehicles';
import { MOCK_RENTAL_HISTORY, MOCK_UPCOMING_RENTALS } from '../constants/mockRentals';
import { colors, fonts, layout, moneyText } from '../theme';
import type {
  Coordinate,
  Vehicle,
} from '../types/map';
import type { AppNotification } from '../types/notification';
import type { RentalRecord } from '../types/rental';
import type { DiscoverCategory } from '../types/navigation';

const homeLocationIcon = require('../../assets/images/home-location-icon.png');
const profileImage = require('../../assets/images/10075.jpeg');
const brands = [
  { name: 'Toyota', image: require('../../assets/images/brands/toyota.png') },
  { name: 'BMW', image: require('../../assets/images/brands/bmw.png') },
  { name: 'Mercedes-Benz', image: require('../../assets/images/brands/benz.png') },
  { name: 'Mitsubishi', image: require('../../assets/images/brands/mitsubishi.png') },
  { name: 'Acura', image: require('../../assets/images/brands/acura.png') },
] as const;
const services = [
  { name: 'Maintenance', category: 'Maintenance', image: require('../../assets/images/service icons/repair.png') },
  { name: 'Spare Parts', category: 'Parts', image: require('../../assets/images/service icons/spare parts.png') },
  { name: 'Roadside Help', category: 'Towing', image: require('../../assets/images/service icons/tow truck.png') },
  { name: 'Insurance', category: 'Insurance', image: require('../../assets/images/service icons/insurance.png') },
] as const;

function formatAddress(
  address: Location.LocationGeocodedAddress | undefined,
  coordinate: Coordinate,
) {
  if (!address) {
    return `${coordinate.latitude.toFixed(3)}, ${coordinate.longitude.toFixed(3)}`;
  }

  const town =
    address.city || address.district || address.subregion || address.region;
  const streetAddress = [address.streetNumber, address.street]
    .filter(Boolean)
    .join(' ');
  const specificLocation = [
    address.district,
    streetAddress,
    address.name,
    address.subregion,
  ].find(
    (part) =>
      Boolean(part) &&
      part?.trim().toLowerCase() !== town?.trim().toLowerCase() &&
      part?.trim().toLowerCase() !== address.country?.trim().toLowerCase(),
  );

  if (specificLocation && town) return `${specificLocation}, ${town}`;
  if (specificLocation) return specificLocation;
  if (town) return `Current area, ${town}`;

  return `${coordinate.latitude.toFixed(3)}, ${coordinate.longitude.toFixed(3)}`;
}

type HomeScreenProps = {
  notifications?: AppNotification[];
  onClearNotifications?: () => void;
  onMarkAllNotificationsRead?: () => void;
  onMarkNotificationRead?: (notificationId: string) => void;
  onOpenVehicle?: (vehicle: Vehicle, userLocation: Coordinate) => void;
  onOpenRental?: (rental: RentalRecord) => void;
  onOpenService?: (category: DiscoverCategory) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};

export function HomeScreen({
  notifications = [],
  onClearNotifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onOpenVehicle,
  onOpenRental,
  onOpenService,
  onTabPress,
  unreadMessagesCount = 0,
}: HomeScreenProps) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [center, setCenter] = useState<Coordinate>(BONASSAMA_COORDINATE);
  const [isLocating, setIsLocating] = useState(true);
  const [isNotificationSheetVisible, setIsNotificationSheetVisible] =
    useState(false);
  const [locationLabel, setLocationLabel] = useState('Bonassama, Dla');
  const [searchQuery, setSearchQuery] = useState('');
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;
  const homeRentals = [
    MOCK_RENTAL_HISTORY.find(({ id }) => id === 'rental-completed-yaris-2010'),
    MOCK_UPCOMING_RENTALS.find(({ id }) => id === 'rental-upcoming-4runner'),
    MOCK_RENTAL_HISTORY.find(({ id }) => id === 'rental-canceled-yaris-2012'),
  ].filter((rental): rental is RentalRecord => Boolean(rental));

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      try {
        let permission = await Location.getForegroundPermissionsAsync();

        if (!permission.granted && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (!permission.granted) return;

        const lastKnownPosition = await Location.getLastKnownPositionAsync({
          maxAge: 60_000,
          requiredAccuracy: 500,
        });

        if (lastKnownPosition && isMounted) {
          setCenter({
            latitude: lastKnownPosition.coords.latitude,
            longitude: lastKnownPosition.coords.longitude,
          });
        }

        let position = lastKnownPosition;

        try {
          position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
        } catch {
          // A recent cached position is still useful if a fresh fix times out.
        }

        if (!position) return;

        if (!isMounted) return;

        const currentCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCenter(currentCoordinate);

        try {
          const addresses = await Location.reverseGeocodeAsync(currentCoordinate);
          if (isMounted) {
            setLocationLabel(formatAddress(addresses[0], currentCoordinate));
          }
        } catch {
          // The map remains usable with coordinates if address lookup is unavailable.
        }
      } catch {
        // The Bonassama fallback keeps discovery useful when GPS is unavailable.
      } finally {
        if (isMounted) setIsLocating(false);
      }
    };

    loadLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return MOCK_HOME_VEHICLES.filter((vehicle) => {
      const matchesBrand = !activeBrand || vehicle.brand === activeBrand;
      const matchesSearch =
        !normalizedQuery ||
        `${vehicle.brand} ${vehicle.model} ${vehicle.category}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesBrand && vehicle.available && matchesSearch;
    });
  }, [activeBrand, searchQuery]);

  const nearbyVehicles = useMemo(
    () =>
      filteredVehicles.map((vehicle) => ({
        ...vehicle,
        coordinate: {
          latitude:
            center.latitude +
            (vehicle.coordinate.latitude - BONASSAMA_COORDINATE.latitude),
          longitude:
            center.longitude +
            (vehicle.coordinate.longitude - BONASSAMA_COORDINATE.longitude),
        },
      })),
    [center.latitude, center.longitude, filteredVehicles],
  );
  const popularVehicles = useMemo(
    () =>
      ['toyota-4runner', 'toyota-yaris-2013', 'toyota-yaris-2012']
        .flatMap((vehicleId) => {
          const vehicle = nearbyVehicles.find(({ id }) => id === vehicleId);
          return vehicle ? [vehicle] : [];
        }),
    [nearbyVehicles],
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={styles.contentFrame}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationCaption}>Your Location</Text>
              <View style={styles.locationRow}>
                <Image
                  resizeMode="contain"
                  source={homeLocationIcon}
                  style={styles.locationIcon}
                />
                <Text numberOfLines={1} style={styles.locationText}>
                  {isLocating ? 'Finding your location…' : locationLabel}
                </Text>
                {isLocating && (
                  <ActivityIndicator color={colors.white} size="small" />
                )}
              </View>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                accessibilityLabel="Notifications"
                accessibilityRole="button"
                onPress={() => setIsNotificationSheetVisible(true)}
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed && styles.controlPressed,
                ]}
              >
                <AppIcon color={colors.white} name="notification" size={22} />
                {unreadNotificationCount > 0 && (
                  <View style={styles.notificationDot} />
                )}
              </Pressable>

              <Pressable
                accessibilityLabel="Open profile"
                accessibilityRole="button"
                onPress={() => onTabPress?.('profile')}
                style={({ pressed }) => [
                  styles.avatarButton,
                  pressed && styles.controlPressed,
                ]}
              >
                <Image source={profileImage} style={styles.avatar} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.heroTitle}>Find your next car</Text>
        </SafeAreaView>

        <View style={styles.sheet}>
          <CarSearchBar value={searchQuery} onChangeText={setSearchQuery} onFilterPress={() => onTabPress?.('discover')} />

          <ScrollView
            style={styles.bodyScroller}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Brands</Text>{activeBrand && <Pressable onPress={() => setActiveBrand(null)}><Text style={styles.exploreText}>See All</Text></Pressable>}</View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandList}>
            {brands.map((brand) => <Pressable key={brand.name} accessibilityRole="button" accessibilityState={{ selected: activeBrand === brand.name }} onPress={() => setActiveBrand(activeBrand === brand.name ? null : brand.name)} style={styles.brandItem}>
              <View style={[styles.brandCircle, activeBrand === brand.name && styles.brandCircleActive]}><Image source={brand.image} resizeMode="contain" style={styles.brandImage} /></View>
              <Text numberOfLines={1} style={styles.brandName}>{brand.name === 'Mercedes-Benz' ? 'Mercedes' : brand.name}</Text>
            </Pressable>)}
          </ScrollView>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{activeBrand ? `${activeBrand} cars` : 'Available Cars'}</Text><Pressable onPress={() => onTabPress?.('discover')}><Text style={styles.exploreText}>See All</Text></Pressable></View>
          {nearbyVehicles.length ? <View>
            {nearbyVehicles.map(vehicle => <ListingCarCard key={vehicle.id} vehicle={vehicle} onPress={() => onOpenVehicle?.(vehicle, center)} />)}
          </View> : <View style={styles.emptyState}><Text style={styles.emptyTitle}>No cars found</Text><Text style={styles.emptyDescription}>Try another brand or search.</Text><Pressable onPress={() => { setActiveBrand(null); setSearchQuery(''); }}><Text style={styles.clearFiltersText}>Show all cars</Text></Pressable></View>}
          {popularVehicles.length > 0 && <>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Popular Cars</Text><Pressable onPress={() => onTabPress?.('discover')}><Text style={styles.exploreText}>See All</Text></Pressable></View>
            <View>
              {popularVehicles.map(vehicle => <ListingCarCard key={vehicle.id} vehicle={vehicle} onPress={() => onOpenVehicle?.(vehicle, center)} />)}
            </View>
          </>}
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Services</Text><Text style={styles.exploreText}>See all</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceList}>
            {services.map((service) => <Pressable key={service.name} accessibilityRole="button" onPress={() => onOpenService?.(service.category)} style={styles.serviceItem}>
              <View style={styles.serviceCircle}><Image source={service.image} resizeMode="contain" style={styles.serviceImage} /></View>
              <Text numberOfLines={1} style={styles.serviceName}>{service.name}</Text>
            </Pressable>)}
          </ScrollView>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <Pressable accessibilityRole="button" onPress={() => onTabPress?.('activity')}><Text style={styles.exploreText}>See all</Text></Pressable>
          </View>
          {homeRentals.length ? <View style={styles.activityList}>{homeRentals.map((rental) => <Pressable key={rental.id} accessibilityRole="button" accessibilityLabel={`View ${rental.vehicle.brand} ${rental.vehicle.model} rental details`} onPress={() => onOpenRental?.(rental)} style={({ pressed }) => [styles.activityCard, pressed && styles.controlPressed]}>
            <Image source={rental.vehicle.image} resizeMode="contain" style={styles.activityImage} />
            <View style={styles.activityInfo}>
              <View style={styles.activityTopDetails}>
                <Text numberOfLines={1} style={styles.activityName}>{rental.vehicle.brand} {rental.vehicle.model}</Text>
                <Text style={styles.activityDate}>{rental.startDate} – {rental.endDate}</Text>
              </View>
              <Text style={[styles.activityStatus, rental.status === 'canceled' && styles.activityCanceled]}>{rental.status === 'confirmed' ? 'Upcoming rental' : `${rental.status.charAt(0).toUpperCase()}${rental.status.slice(1)} rental`}</Text>
            </View>
            <View style={styles.activityAction}><AppIcon name="chevronRight" color={colors.primaryBrandBlue} size={16} /></View>
          </Pressable>)}</View> : <View style={styles.activityEmpty}><Text style={styles.emptyDescription}>Your rentals and services will appear here.</Text></View>}
          </ScrollView>
        </View>
      </View>

      <HomeBottomNavigation
        onTabPress={onTabPress}
        unreadMessagesCount={unreadMessagesCount}
      />

      <NotificationSheet
        notifications={notifications}
        onClearAll={() => onClearNotifications?.()}
        onClose={() => setIsNotificationSheetVisible(false)}
        onMarkAllRead={() => onMarkAllNotificationsRead?.()}
        onNotificationPress={(notification) => {
          onMarkNotificationRead?.(notification.id);
          if (notification.destination) {
            setIsNotificationSheetVisible(false);
            onTabPress?.(notification.destination);
          }
        }}
        visible={isNotificationSheetVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentFrame: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  header: {
    minHeight: 205,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flex: 1,
    marginRight: 16,
  },
  locationCaption: {
    color: colors.borderGray,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  locationIcon: {
    width: 23,
    height: 23,
  },
  locationText: {
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#283449',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderWidth: 1,
    borderColor: '#283449',
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  avatarButton: {
    width: 46,
    height: 46,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderRadius: 23,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  controlPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 29,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 29,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 34,
    paddingBottom: 0,
  },
  bodyScroller: { flex: 1, marginHorizontal: -layout.screenGutter, marginTop: 10 },
  bodyContent: { paddingHorizontal: layout.screenGutter, paddingBottom: 140 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
    shadowColor: colors.primaryBrandBlue,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButtonActive: {
    backgroundColor: '#163E80',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 0,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 16 },
  brandList: { gap: 16, paddingBottom: 4 },
  brandItem: { width: 70, alignItems: 'center' },
  brandCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F4F6F9', borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  brandCircleActive: { borderColor: colors.primaryBrandBlue, backgroundColor: '#EDF4FE' },
  brandImage: { width: 42, height: 42 },
  brandName: { color: colors.textPrimary, fontFamily: fonts.medium, fontSize: 13, marginTop: 7 },
  serviceList: { gap: 16, paddingBottom: 8 },
  serviceItem: { width: 96, alignItems: 'center' },
  serviceCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#F4F6F9', alignItems: 'center', justifyContent: 'center' },
  serviceImage: { width: 45, height: 45 },
  serviceName: { color: colors.textPrimary, fontFamily: fonts.medium, fontSize: 13, marginTop: 8, textAlign: 'center' },
  activityList: { gap: 14, paddingVertical: 4 },
  activityCard: { minHeight: 112, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderGray, borderRadius: 16, backgroundColor: colors.white, paddingHorizontal: 10, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  activityImage: { width: 100, height: 80, marginRight: 10 },
  activityInfo: { flex: 1, justifyContent: 'space-between', alignSelf: 'stretch', paddingVertical: 19 },
  activityTopDetails: { gap: 7 },
  activityName: { color: colors.textPrimary, fontFamily: fonts.semiBold, fontSize: 14 },
  activityDate: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 },
  activityStatus: { alignSelf: 'flex-start', color: colors.primaryBrandBlue, fontFamily: fonts.medium, fontSize: 12 },
  activityCanceled: { color: colors.textSecondary },
  activityAction: { alignItems: 'center', gap: 2, marginLeft: 5 },
  activityActionText: { color: colors.primaryBrandBlue, fontFamily: fonts.medium, fontSize: 12 },
  activityEmpty: { minHeight: 90, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderGray, borderRadius: 16 },
  carScroller: { marginHorizontal: -layout.screenGutter },
  carList: { gap: 16, paddingTop: 14, paddingBottom: 24, paddingHorizontal: layout.screenGutter + 16 },
  carCard: { width: 210, height: 245, borderRadius: 17, backgroundColor: colors.white, paddingTop: 16, paddingHorizontal: 14, shadowColor: '#1A2540', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.14, shadowRadius: 13, elevation: 6 },
  cardBrand: { color: colors.textSecondary, fontFamily: fonts.semiBold, fontSize: 14 },
  cardModel: { color: colors.textPrimary, fontFamily: fonts.medium, fontSize: 13, marginTop: 3 },
  carImage: { position: 'absolute', left: 5, top: 62, width: 200, height: 130 },
  cardFooter: { marginTop: 'auto', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardPrice: { color: colors.primaryDark, fontSize: 17, marginBottom: 12,  ...moneyText },
  cardPerDay: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 },
  cardArrow: { width: 46, height: 49, marginRight: -14, borderTopLeftRadius: 17, borderBottomRightRadius: 17, backgroundColor: colors.primaryBrandBlue, alignItems: 'center', justifyContent: 'center' },
  featuredList: {
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
  },
  featuredScroller: {
    height: 290,
    flexGrow: 0,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  recommendedTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  exploreText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedList: {
    paddingTop: 16,
  },
  emptyState: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGray,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 6,
  },
  clearFiltersText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 16,
  },
});

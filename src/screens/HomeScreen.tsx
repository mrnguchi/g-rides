import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  NearbyCarsMap,
  NotificationSheet,
  VehicleCategoryFilterBar,
  VehicleCard,
} from '../components';
import type { MainTab } from '../components';
import {
  BONASSAMA_COORDINATE,
  MOCK_NEARBY_VEHICLES,
  MOCK_RECOMMENDED_VEHICLES,
} from '../constants/mockVehicles';
import { colors, fonts, layout } from '../theme';
import type {
  Coordinate,
  Vehicle,
  VehicleCategoryFilter,
} from '../types/map';
import type { AppNotification } from '../types/notification';

const homeLocationIcon = require('../../assets/images/home-location-icon.png');
const profileImage = require('../../assets/images/10075.jpeg');

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
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};

export function HomeScreen({
  notifications = [],
  onClearNotifications,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  onOpenVehicle,
  onTabPress,
  unreadMessagesCount = 0,
}: HomeScreenProps) {
  const [activeCategory, setActiveCategory] =
    useState<VehicleCategoryFilter>('All Cars');
  const [center, setCenter] = useState<Coordinate>(BONASSAMA_COORDINATE);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(['toyota-land-cruiser-black']),
  );
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const [isEmbeddedMapActive, setIsEmbeddedMapActive] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [isNotificationSheetVisible, setIsNotificationSheetVisible] =
    useState(false);
  const [locationLabel, setLocationLabel] = useState('Bonassama, Dla');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const nearbyCarouselRef = useRef<ScrollView>(null);
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

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

    return MOCK_NEARBY_VEHICLES.filter((vehicle) => {
      const matchesCategory =
        activeCategory === 'All Cars' || vehicle.category === activeCategory;
      const matchesAvailability = !isAvailableOnly || vehicle.available;
      const matchesSearch =
        !normalizedQuery ||
        `${vehicle.brand} ${vehicle.model} ${vehicle.category}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [activeCategory, isAvailableOnly, searchQuery]);

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

  useEffect(() => {
    if (
      selectedVehicleId &&
      !nearbyVehicles.some(({ id }) => id === selectedVehicleId)
    ) {
      setSelectedVehicleId(undefined);
    }
  }, [nearbyVehicles, selectedVehicleId]);

  const toggleFavorite = (vehicleId: string) => {
    setFavoriteIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(vehicleId)) nextIds.delete(vehicleId);
      else nextIds.add(vehicleId);
      return nextIds;
    });
  };

  const selectNearbyVehicle = useCallback(
    (vehicle: Vehicle) => {
      setSelectedVehicleId(vehicle.id);
      const vehicleIndex = nearbyVehicles.findIndex(
        ({ id }) => id === vehicle.id,
      );

      if (vehicleIndex >= 0) {
        nearbyCarouselRef.current?.scrollTo({
          animated: true,
          x: vehicleIndex * 212,
        });
      }
    },
    [nearbyVehicles],
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isEmbeddedMapActive}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationCaption}>Location</Text>
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
                <Ionicons
                  color={colors.white}
                  name="notifications"
                  size={22}
                />
                {unreadNotificationCount > 0 && (
                  <View style={styles.notificationDot} />
                )}
              </Pressable>

              <Pressable
                accessibilityLabel="Open profile"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.avatarButton,
                  pressed && styles.controlPressed,
                ]}
              >
                <Image source={profileImage} style={styles.avatar} />
              </Pressable>
            </View>
          </View>

          <Text style={styles.heroTitle}>Find cars{`\n`}In your location</Text>
        </SafeAreaView>

        <View style={styles.sheet}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons
                color={colors.textSecondary}
                name="search-outline"
                size={22}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setSearchQuery}
                placeholder="Search cars or location"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                style={styles.searchInput}
                value={searchQuery}
              />
              {!!searchQuery && (
                <Pressable
                  accessibilityLabel="Clear search"
                  hitSlop={8}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons
                    color={colors.textSecondary}
                    name="close-circle"
                    size={19}
                  />
                </Pressable>
              )}
            </View>

            <Pressable
              accessibilityLabel={
                isAvailableOnly
                  ? 'Show all cars'
                  : 'Show only available cars'
              }
              accessibilityRole="button"
              accessibilityState={{ selected: isAvailableOnly }}
              onPress={() => setIsAvailableOnly((isActive) => !isActive)}
              style={({ pressed }) => [
                styles.filterButton,
                isAvailableOnly && styles.filterButtonActive,
                pressed && styles.controlPressed,
              ]}
            >
              <Ionicons color={colors.white} name="options-outline" size={25} />
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Cars nearby</Text>
          <VehicleCategoryFilterBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <NearbyCarsMap
            activeCategory={activeCategory}
            center={center}
            onCategoryChange={setActiveCategory}
            onInteractionChange={setIsEmbeddedMapActive}
            onVehiclePress={selectNearbyVehicle}
            selectedVehicleId={selectedVehicleId}
            vehicles={nearbyVehicles}
          />

          {nearbyVehicles.length ? (
            <ScrollView
              ref={nearbyCarouselRef}
              contentContainerStyle={styles.featuredList}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.featuredScroller}
            >
              {nearbyVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  favorite={favoriteIds.has(vehicle.id)}
                  onPress={() => {
                    selectNearbyVehicle(vehicle);
                    onOpenVehicle?.(vehicle, center);
                  }}
                  onToggleFavorite={() => toggleFavorite(vehicle.id)}
                  selected={selectedVehicleId === vehicle.id}
                  vehicle={vehicle}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name="car-sport-outline"
                  size={30}
                />
              </View>
              <Text style={styles.emptyTitle}>No cars found</Text>
              <Text style={styles.emptyDescription}>
                Try another search or clear your filters.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setActiveCategory('All Cars');
                  setIsAvailableOnly(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearFiltersText}>Clear filters</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.recommendedHeader}>
            <Text style={styles.recommendedTitle}>Recommended for you</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => onTabPress?.('discover')}
            >
              <Text style={styles.exploreText}>Discover more</Text>
            </Pressable>
          </View>

          <View style={styles.recommendedList}>
            {MOCK_RECOMMENDED_VEHICLES.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                favorite={favoriteIds.has(vehicle.id)}
                onPress={() => onOpenVehicle?.(vehicle, center)}
                onToggleFavorite={() => toggleFavorite(vehicle.id)}
                variant="recommended"
                vehicle={vehicle}
              />
            ))}
          </View>
        </View>
      </ScrollView>

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
  scrollContent: {
    backgroundColor: colors.primaryDark,
  },
  header: {
    minHeight: 232,
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
    fontSize: 13,
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
    minHeight: 900,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 34,
    paddingBottom: 140,
  },
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
    marginTop: 24,
  },
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
    fontSize: 13,
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
    fontSize: 13,
    marginTop: 6,
  },
  clearFiltersText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
});

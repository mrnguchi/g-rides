import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type MapStyleElement,
} from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HomeBottomNavigation,
  VehicleCard,
  VehicleCategoryFilterBar,
} from '../components';
import { VehicleMapMarker } from '../components/VehicleMapMarker';
import type { MainTab } from '../components';
import {
  BONASSAMA_COORDINATE,
  MOCK_NEARBY_VEHICLES,
} from '../constants/mockVehicles';
import { colors, fonts, layout } from '../theme';
import type {
  Coordinate,
  Vehicle,
  VehicleCategoryFilter,
} from '../types/map';

type DiscoverScreenProps = {
  onOpenVehicle?: (vehicle: Vehicle, userLocation: Coordinate) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};

type DiscoverView = 'list' | 'map';
type SheetPosition = 'collapsed' | 'expanded' | 'half';
type SortOption = 'Nearest' | 'Price: Low to High' | 'Recommended' | 'Top Rated';
type RadiusFilter = 2 | 8 | 15 | 'Any';

const radiusFilters: RadiusFilter[] = [2, 8, 15, 'Any'];
const sortOptions: SortOption[] = [
  'Recommended',
  'Nearest',
  'Price: Low to High',
  'Top Rated',
];

const mutedMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#F3F5F8' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8B94A4' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#EEF1F5' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E4E8EE' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#E7EEF7' }],
  },
];

function matchesVehicleSearch(vehicle: Vehicle, query: string) {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.category}`
    .toLowerCase()
    .includes(query);
}

function radiusLabel(radius: RadiusFilter) {
  return radius === 'Any' ? 'Any distance' : `Within ${radius} km`;
}

export function DiscoverScreen({
  onOpenVehicle,
  onTabPress,
  unreadMessagesCount = 0,
}: DiscoverScreenProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const mapRef = useRef<MapView>(null);
  const resultListRef = useRef<ScrollView>(null);
  const resultListOffsetRef = useRef(0);
  const [activeCategory, setActiveCategory] =
    useState<VehicleCategoryFilter>('All Cars');
  const [activeRadius, setActiveRadius] = useState<RadiusFilter>(8);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(['toyota-land-cruiser-black']),
  );
  const [hasAnyDistanceLocation, setHasAnyDistanceLocation] = useState(false);
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string>();
  const [mapCenter, setMapCenter] = useState<Coordinate>(BONASSAMA_COORDINATE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>();
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('half');
  const [sortOption, setSortOption] = useState<SortOption>('Recommended');
  const [userLocation, setUserLocation] =
    useState<Coordinate>(BONASSAMA_COORDINATE);
  const [viewMode, setViewMode] = useState<DiscoverView>('map');

  const expandedTop = Math.max(insets.top + 160, 180);
  const halfTop = Math.max(expandedTop + 150, Math.round(height * 0.56));
  const collapsedTop = Math.max(
    halfTop + 100,
    height - insets.bottom - 184,
  );
  const halfOffset = halfTop - expandedTop;
  const collapsedOffset = collapsedTop - expandedTop;
  const sheetTranslateY = useRef(new Animated.Value(halfOffset)).current;
  const dragStartOffsetRef = useRef(halfOffset);

  const snapSheetTo = useCallback(
    (position: SheetPosition) => {
      const target =
        position === 'expanded'
          ? 0
          : position === 'half'
            ? halfOffset
            : collapsedOffset;

      setSheetPosition(position);
      if (position !== 'expanded') {
        resultListOffsetRef.current = 0;
        resultListRef.current?.scrollTo({ animated: false, y: 0 });
      }
      Animated.spring(sheetTranslateY, {
        toValue: target,
        damping: 24,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }).start();
    },
    [collapsedOffset, halfOffset, sheetTranslateY],
  );

  const moveSheetWithGesture = useCallback(
    (distanceY: number) => {
      const nextValue = Math.min(
        collapsedOffset,
        Math.max(0, dragStartOffsetRef.current + distanceY),
      );
      sheetTranslateY.setValue(nextValue);
    },
    [collapsedOffset, sheetTranslateY],
  );

  const finishSheetGesture = useCallback(
    (distanceY: number, velocityY: number) => {
      const hasUpwardIntent = distanceY < -22 || velocityY < -0.35;
      const hasDownwardIntent = distanceY > 22 || velocityY > 0.35;

      if (hasUpwardIntent) {
        snapSheetTo(
          dragStartOffsetRef.current > halfOffset + 12 ? 'half' : 'expanded',
        );
        return;
      }

      if (hasDownwardIntent) {
        snapSheetTo(
          dragStartOffsetRef.current < halfOffset - 12 ? 'half' : 'collapsed',
        );
        return;
      }

      const projectedOffset = Math.min(
        collapsedOffset,
        Math.max(
          0,
          dragStartOffsetRef.current + distanceY + velocityY * 55,
        ),
      );
      const candidates: Array<[SheetPosition, number]> = [
        ['expanded', 0],
        ['half', halfOffset],
        ['collapsed', collapsedOffset],
      ];
      const nearest = candidates.reduce((best, candidate) =>
        Math.abs(candidate[1] - projectedOffset) <
        Math.abs(best[1] - projectedOffset)
          ? candidate
          : best,
      );
      snapSheetTo(nearest[0]);
    },
    [collapsedOffset, halfOffset, snapSheetTo],
  );

  const beginSheetGesture = useCallback(() => {
    sheetTranslateY.stopAnimation((currentValue) => {
      dragStartOffsetRef.current = currentValue;
    });
  }, [sheetTranslateY]);

  useEffect(() => {
    const target =
      viewMode === 'list'
        ? 0
        : sheetPosition === 'collapsed'
          ? collapsedOffset
          : sheetPosition === 'half'
            ? halfOffset
            : 0;
    sheetTranslateY.setValue(target);
  }, [collapsedOffset, halfOffset, height, insets.bottom, viewMode]);

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: beginSheetGesture,
        onPanResponderMove: (_, gesture) => moveSheetWithGesture(gesture.dy),
        onPanResponderRelease: (_, gesture) =>
          finishSheetGesture(gesture.dy, gesture.vy),
        onPanResponderTerminate: () => snapSheetTo(sheetPosition),
      }),
    [
      beginSheetGesture,
      finishSheetGesture,
      moveSheetWithGesture,
      sheetPosition,
      snapSheetTo,
    ],
  );

  const resultListPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          const isVerticalGesture =
            Math.abs(gesture.dy) > 7 &&
            Math.abs(gesture.dy) > Math.abs(gesture.dx);

          if (!isVerticalGesture) return false;
          if (sheetPosition !== 'expanded') return true;

          return resultListOffsetRef.current <= 1 && gesture.dy > 0;
        },
        onPanResponderGrant: beginSheetGesture,
        onPanResponderMove: (_, gesture) => moveSheetWithGesture(gesture.dy),
        onPanResponderRelease: (_, gesture) =>
          finishSheetGesture(gesture.dy, gesture.vy),
        onPanResponderTerminate: () => snapSheetTo(sheetPosition),
      }),
    [
      beginSheetGesture,
      finishSheetGesture,
      moveSheetWithGesture,
      sheetPosition,
      snapSheetTo,
    ],
  );

  useEffect(() => {
    let mounted = true;

    const loadCurrentLocation = async () => {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!permission.granted) return;

        const cached = await Location.getLastKnownPositionAsync({
          maxAge: 60_000,
          requiredAccuracy: 500,
        });
        let position = cached;

        try {
          position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        } catch {
          // A cached position remains a useful discovery origin.
        }

        if (!mounted || !position) return;
        const coordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(coordinate);
        setMapCenter(coordinate);
      } catch {
        // Bonassama remains the offline/demo fallback.
      }
    };

    void loadCurrentLocation();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMapReady) return;
    mapRef.current?.animateToRegion(
      {
        ...mapCenter,
        latitudeDelta: 0.014,
        longitudeDelta: 0.014,
      },
      600,
    );
  }, [isMapReady, mapCenter.latitude, mapCenter.longitude]);

  const shiftedVehicles = useMemo(
    () =>
      MOCK_NEARBY_VEHICLES.map((vehicle) => ({
        ...vehicle,
        coordinate: {
          latitude:
            mapCenter.latitude +
            (vehicle.coordinate.latitude - BONASSAMA_COORDINATE.latitude),
          longitude:
            mapCenter.longitude +
            (vehicle.coordinate.longitude - BONASSAMA_COORDINATE.longitude),
        },
      })),
    [mapCenter.latitude, mapCenter.longitude],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasVehicleTextMatch = useMemo(
    () =>
      Boolean(normalizedQuery) &&
      shiftedVehicles.some((vehicle) =>
        matchesVehicleSearch(vehicle, normalizedQuery),
      ),
    [normalizedQuery, shiftedVehicles],
  );

  const resultVehicles = useMemo(() => {
    const filtered = shiftedVehicles.filter((vehicle) => {
      const categoryMatches =
        activeCategory === 'All Cars' || vehicle.category === activeCategory;
      const radiusMatches =
        activeRadius === 'Any' || vehicle.distanceKm <= activeRadius;
      const availabilityMatches = !isAvailableOnly || vehicle.available;
      const textMatches =
        !normalizedQuery ||
        !hasVehicleTextMatch ||
        matchesVehicleSearch(vehicle, normalizedQuery);

      return (
        categoryMatches && radiusMatches && availabilityMatches && textMatches
      );
    });

    return [...filtered].sort((first, second) => {
      if (sortOption === 'Nearest') return first.distanceKm - second.distanceKm;
      if (sortOption === 'Price: Low to High') {
        return first.pricePerDayXaf - second.pricePerDayXaf;
      }
      if (sortOption === 'Top Rated') return second.rating - first.rating;
      return Number(second.available) - Number(first.available);
    });
  }, [
    activeCategory,
    activeRadius,
    hasVehicleTextMatch,
    isAvailableOnly,
    normalizedQuery,
    shiftedVehicles,
    sortOption,
  ]);
  const needsAnyDistanceLocation =
    activeRadius === 'Any' && !hasAnyDistanceLocation;

  useEffect(() => {
    if (
      selectedVehicleId &&
      !resultVehicles.some(({ id }) => id === selectedVehicleId)
    ) {
      setSelectedVehicleId(undefined);
    }
  }, [resultVehicles, selectedVehicleId]);

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    if (viewMode === 'map') snapSheetTo('half');
    mapRef.current?.animateToRegion(
      {
        ...vehicle.coordinate,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      },
      420,
    );
  };

  const toggleFavorite = (vehicleId: string) => {
    setFavoriteIds((current) => {
      const next = new Set(current);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  };

  const searchLocation = async () => {
    const query = searchQuery.trim();
    Keyboard.dismiss();
    setLocationSearchError(undefined);

    if (!query || hasVehicleTextMatch) {
      snapSheetTo(viewMode === 'map' ? 'half' : 'expanded');
      return;
    }

    setIsSearchingLocation(true);
    try {
      if (Platform.OS === 'android') {
        let permission = await Location.getForegroundPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!permission.granted) {
          setLocationSearchError('Location permission is needed to search.');
          return;
        }
      }

      const includesCountry = query.toLowerCase().includes('cameroon');
      let results = await Location.geocodeAsync(
        includesCountry ? query : `${query}, Cameroon`,
      );
      if (!results.length && !includesCountry) {
        results = await Location.geocodeAsync(query);
      }
      const result = results[0];
      if (!result) {
        setLocationSearchError('We could not find that location.');
        return;
      }

      setSelectedVehicleId(undefined);
      setMapCenter({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setHasAnyDistanceLocation(true);
      setViewMode('map');
      snapSheetTo('half');
    } catch {
      setLocationSearchError('Location search is unavailable right now.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const changeViewMode = (mode: DiscoverView) => {
    setViewMode(mode);
    setIsSortMenuVisible(false);
    snapSheetTo(mode === 'list' ? 'expanded' : 'half');
  };

  const selectMapLocation = (event: MapPressEvent) => {
    Keyboard.dismiss();
    setIsSortMenuVisible(false);

    if (activeRadius === 'Any') {
      setMapCenter(event.nativeEvent.coordinate);
      setHasAnyDistanceLocation(true);
      setSearchQuery('');
      setSelectedVehicleId(undefined);
      snapSheetTo('half');
      return;
    }

    if (sheetPosition === 'expanded') snapSheetTo('half');
  };

  const cycleSheetPosition = () => {
    if (sheetPosition === 'collapsed') snapSheetTo('half');
    else if (sheetPosition === 'half') snapSheetTo('expanded');
    else snapSheetTo('half');
  };

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor="transparent" style="dark" translucent />

      {viewMode === 'map' ? (
        <MapView
          ref={mapRef}
          customMapStyle={mutedMapStyle}
          initialRegion={{
            ...mapCenter,
            latitudeDelta: 0.014,
            longitudeDelta: 0.014,
          }}
          loadingBackgroundColor={colors.surfaceGray}
          loadingEnabled
          loadingIndicatorColor={colors.primaryBrandBlue}
          mapPadding={{
            top: insets.top + 165,
            right: 10,
            bottom: Math.max(220, height - halfTop + 20),
            left: 10,
          }}
          moveOnMarkerPress={false}
          onMapReady={() => setIsMapReady(true)}
          onPress={selectMapLocation}
          paddingAdjustmentBehavior="never"
          pitchEnabled={false}
          provider={PROVIDER_GOOGLE}
          rotateEnabled={false}
          showsBuildings={false}
          showsCompass={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
          style={StyleSheet.absoluteFill}
          toolbarEnabled={false}
        >
          <Circle
            center={mapCenter}
            fillColor="rgba(37, 99, 235, 0.13)"
            radius={75}
            strokeColor="rgba(37, 99, 235, 0.08)"
          />
          <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={mapCenter} zIndex={40}>
            <View style={styles.locationMarkerOuter}>
              <View style={styles.locationMarkerInner} />
            </View>
          </Marker>
          {resultVehicles.map((vehicle) => (
            <VehicleMapMarker
              key={vehicle.id}
              onPress={selectVehicle}
              selected={vehicle.id === selectedVehicleId}
              vehicle={vehicle}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.listBackground} />
      )}

      <View
        pointerEvents="box-none"
        style={[styles.topControls, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons
              color={colors.textSecondary}
              name="search-outline"
              size={21}
            />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSearchingLocation}
              onChangeText={(value) => {
                setSearchQuery(value);
                setLocationSearchError(undefined);
              }}
              onFocus={() => setIsSortMenuVisible(false)}
              onSubmitEditing={() => void searchLocation()}
              placeholder="Search cars or location"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="search"
              selectionColor={colors.primaryBrandBlue}
              style={styles.searchInput}
              value={searchQuery}
            />
            {isSearchingLocation ? (
              <ActivityIndicator color={colors.primaryBrandBlue} size="small" />
            ) : searchQuery ? (
              <Pressable
                accessibilityLabel="Clear search"
                hitSlop={8}
                onPress={() => {
                  setSearchQuery('');
                  setLocationSearchError(undefined);
                }}
              >
                <Ionicons
                  color={colors.textSecondary}
                  name="close-circle"
                  size={19}
                />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel="Show only available vehicles"
            accessibilityRole="button"
            accessibilityState={{ selected: isAvailableOnly }}
            onPress={() => setIsAvailableOnly((current) => !current)}
            style={({ pressed }) => [
              styles.filterButton,
              isAvailableOnly && styles.activeFilterButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons color={colors.white} name="options-outline" size={25} />
            {isAvailableOnly && <View style={styles.filterActiveDot} />}
          </Pressable>
        </View>

        {locationSearchError && (
          <View style={styles.searchError}>
            <Ionicons color={colors.error} name="alert-circle" size={14} />
            <Text style={styles.searchErrorText}>{locationSearchError}</Text>
          </View>
        )}

        <VehicleCategoryFilterBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <View style={styles.mapControlRow}>
          <View style={styles.viewSwitcher}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: viewMode === 'map' }}
              onPress={() => changeViewMode('map')}
              style={[
                styles.viewOption,
                viewMode === 'map' && styles.activeViewOption,
              ]}
            >
              <Ionicons
                color={
                  viewMode === 'map' ? colors.white : colors.textSecondary
                }
                name="map-outline"
                size={14}
              />
              <Text
                style={[
                  styles.viewOptionText,
                  viewMode === 'map' && styles.activeViewOptionText,
                ]}
              >
                Map view
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: viewMode === 'list' }}
              onPress={() => changeViewMode('list')}
              style={[
                styles.viewOption,
                viewMode === 'list' && styles.activeViewOption,
              ]}
            >
              <Ionicons
                color={
                  viewMode === 'list' ? colors.white : colors.textSecondary
                }
                name="list"
                size={14}
              />
              <Text
                style={[
                  styles.viewOptionText,
                  viewMode === 'list' && styles.activeViewOptionText,
                ]}
              >
                List view
              </Text>
            </Pressable>
          </View>

          <View>
            <Pressable
              accessibilityLabel={`Sort by ${sortOption}`}
              accessibilityRole="button"
              onPress={() => setIsSortMenuVisible((current) => !current)}
              style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
            >
              <Text style={styles.sortButtonText}>Sort by</Text>
              <Ionicons color={colors.textPrimary} name="chevron-down" size={14} />
            </Pressable>
            {isSortMenuVisible && (
              <View style={styles.sortMenu}>
                {sortOptions.map((option) => (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => {
                      setSortOption(option);
                      setIsSortMenuVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.sortMenuOption,
                      pressed && styles.sortMenuOptionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortMenuText,
                        option === sortOption && styles.activeSortMenuText,
                      ]}
                    >
                      {option}
                    </Text>
                    {option === sortOption && (
                      <Ionicons
                        color={colors.primaryBrandBlue}
                        name="checkmark"
                        size={16}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {viewMode === 'map' && (
        <Pressable
          accessibilityLabel="Recenter map on your location"
          accessibilityRole="button"
          onPress={() => {
            setMapCenter(userLocation);
            if (activeRadius === 'Any') setHasAnyDistanceLocation(true);
            setSearchQuery('');
            setSelectedVehicleId(undefined);
          }}
          style={({ pressed }) => [
            styles.recenterButton,
            { bottom: height - halfTop + 16 },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons color={colors.primaryBrandBlue} name="locate" size={23} />
        </Pressable>
      )}

      <Animated.View
        style={[
          styles.resultsSheet,
          {
            height: height - expandedTop + 34,
            top: expandedTop,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <Pressable
          accessibilityHint="Expands or collapses the vehicle results"
          accessibilityLabel="Vehicle results panel"
          accessibilityRole="button"
          onPress={cycleSheetPosition}
          style={styles.sheetHandleArea}
          {...sheetPanResponder.panHandlers}
        >
          <View style={styles.sheetHandle} />
        </Pressable>

        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsCount}>
              {needsAnyDistanceLocation ? '—' : resultVehicles.length}
            </Text>
            <Text style={styles.resultsCountLabel}>
              {needsAnyDistanceLocation
                ? 'choose a search area'
                : resultVehicles.length === 1
                  ? 'car found'
                  : 'cars found'}
            </Text>
          </View>
          <View style={styles.sortSummary}>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="swap-vertical"
              size={14}
            />
            <Text numberOfLines={1} style={styles.sortSummaryText}>
              {sortOption}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.radiusList}
          horizontal
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          style={styles.radiusScroller}
        >
          {radiusFilters.map((radius) => {
            const active = radius === activeRadius;
            return (
              <Pressable
                key={radius}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setActiveRadius(radius);
                  if (radius === 'Any') {
                    setHasAnyDistanceLocation(false);
                    setSelectedVehicleId(undefined);
                  }
                }}
                style={({ pressed }) => [
                  styles.radiusChip,
                  active && styles.activeRadiusChip,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.radiusText,
                    active && styles.activeRadiusText,
                  ]}
                >
                  {radiusLabel(radius)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          style={styles.resultListGestureArea}
          {...resultListPanResponder.panHandlers}
        >
          <ScrollView
            ref={resultListRef}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom + 112, 124),
            }}
            keyboardShouldPersistTaps="handled"
            onScroll={(event) => {
              resultListOffsetRef.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEnabled={sheetPosition === 'expanded'}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            style={styles.resultList}
          >
            {viewMode === 'list' &&
              resultVehicles.length > 0 &&
              !needsAnyDistanceLocation && (
                <View style={styles.listHeadingRow}>
                  <Text style={styles.listHeading}>Vehicles for you</Text>
                  <Text style={styles.listHeadingMeta}>
                    {radiusLabel(activeRadius)}
                  </Text>
                </View>
              )}

            {needsAnyDistanceLocation ? (
              <View style={styles.locationPrompt}>
                <View style={styles.locationPromptIcon}>
                  <Ionicons
                    color={colors.primaryBrandBlue}
                    name="location-outline"
                    size={29}
                  />
                </View>
                <Text style={styles.locationPromptTitle}>
                  Choose where you want to explore
                </Text>
                <Text style={styles.locationPromptText}>
                  Enter a specific town, neighbourhood, or address above
                  {viewMode === 'map'
                    ? ', or tap a location directly on the map.'
                    : ', or switch to Map view and tap a location.'}
                </Text>
                {viewMode === 'list' && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => changeViewMode('map')}
                    style={({ pressed }) => [
                      styles.locationPromptButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons color={colors.white} name="map-outline" size={17} />
                    <Text style={styles.locationPromptButtonText}>
                      Choose on map
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : resultVehicles.length ? (
              resultVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  favorite={favoriteIds.has(vehicle.id)}
                  onPress={() => {
                    selectVehicle(vehicle);
                    onOpenVehicle?.(vehicle, userLocation);
                  }}
                  onToggleFavorite={() => toggleFavorite(vehicle.id)}
                  selected={vehicle.id === selectedVehicleId}
                  variant="recommended"
                  vehicle={vehicle}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    color={colors.primaryBrandBlue}
                    name="car-sport-outline"
                    size={30}
                  />
                </View>
                <Text style={styles.emptyTitle}>No cars match these filters</Text>
                <Text style={styles.emptyText}>
                  Increase the distance or choose another vehicle type.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setActiveCategory('All Cars');
                    setActiveRadius(8);
                    setHasAnyDistanceLocation(false);
                    setIsAvailableOnly(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.clearFilters}>Clear all filters</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>

      <HomeBottomNavigation
        activeTab="discover"
        onTabPress={onTabPress}
        unreadMessagesCount={unreadMessagesCount}
      />
    </View>
  );
}

// Temporary compatibility alias while imports migrate to DiscoverScreen.
export const ExploreScreen = DiscoverScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.backgroundLight,
  },
  listBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backgroundLight,
  },
  topControls: {
    position: 'absolute',
    zIndex: 20,
    top: 0,
    right: 0,
    left: 0,
    paddingHorizontal: layout.screenGutter,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchBar: {
    height: 52,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primaryBrandBlue,
    shadowColor: colors.primaryBrandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 9,
    elevation: 6,
  },
  activeFilterButton: {
    backgroundColor: '#153F84',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  searchError: {
    minHeight: 28,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    marginTop: 7,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchErrorText: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  mapControlRow: {
    zIndex: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 1,
  },
  viewSwitcher: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.96)',
    padding: 3,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  viewOption: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 14,
    paddingHorizontal: 9,
  },
  activeViewOption: {
    backgroundColor: colors.primaryBrandBlue,
  },
  viewOptionText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
  },
  activeViewOptionText: {
    color: colors.white,
  },
  sortButton: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 12,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sortButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  sortMenu: {
    position: 'absolute',
    zIndex: 50,
    top: 40,
    right: 0,
    width: 186,
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 5,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  sortMenuOption: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  sortMenuOptionPressed: {
    backgroundColor: colors.surfaceGray,
  },
  sortMenuText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  activeSortMenuText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  locationMarkerOuter: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: 'rgba(147, 197, 253, 0.52)',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  locationMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  recenterButton: {
    position: 'absolute',
    zIndex: 10,
    right: layout.screenGutter,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 7,
  },
  resultsSheet: {
    position: 'absolute',
    zIndex: 15,
    right: 0,
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
  },
  sheetHandleArea: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CFD4DC',
  },
  resultsHeader: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
  },
  resultsCount: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '700',
  },
  resultsCountLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 1,
  },
  sortSummary: {
    maxWidth: 154,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    backgroundColor: '#F3F7FC',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  sortSummaryText: {
    flexShrink: 1,
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
  },
  radiusScroller: {
    height: 51,
    flexGrow: 0,
  },
  radiusList: {
    gap: 6,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 7,
    paddingBottom: 9,
  },
  radiusChip: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 9,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
  },
  activeRadiusChip: {
    borderColor: '#D8E6FA',
    backgroundColor: '#EDF4FE',
  },
  radiusText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  activeRadiusText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  resultListGestureArea: {
    flex: 1,
  },
  resultList: {
    flex: 1,
    paddingHorizontal: layout.screenGutter,
  },
  listHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 13,
    paddingTop: 2,
  },
  listHeading: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  listHeadingMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  locationPrompt: {
    minHeight: 244,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  locationPromptIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: '#EDF4FE',
  },
  locationPromptTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
  },
  locationPromptText: {
    maxWidth: 300,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
  locationPromptButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    backgroundColor: colors.primaryBrandBlue,
    paddingHorizontal: 17,
    marginTop: 16,
  },
  locationPromptButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: colors.surfaceGray,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 14,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  clearFilters: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 13,
  },
  pressed: {
    opacity: 0.75,
  },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
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
  type MapStyleElement,
} from 'react-native-maps';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts } from '../theme';
import type {
  Coordinate,
  Vehicle,
  VehicleCategoryFilter,
} from '../types/map';
import { BackButton } from './BackButton';
import { VehicleMapMarker } from './VehicleMapMarker';

type NearbyCarsMapProps = {
  activeCategory: VehicleCategoryFilter;
  center: Coordinate;
  onCategoryChange: (category: VehicleCategoryFilter) => void;
  onInteractionChange?: (isActive: boolean) => void;
  onVehiclePress?: (vehicle: Vehicle) => void;
  selectedVehicleId?: string;
  vehicles: Vehicle[];
};

type CarsMapSurfaceProps = {
  center: Coordinate;
  expanded: boolean;
  interactive: boolean;
  onMapPress?: () => void;
  onVehiclePress?: (vehicle: Vehicle) => void;
  selectedVehicleId?: string;
  vehicles: Vehicle[];
};

const categoryFilters: VehicleCategoryFilter[] = [
  'All Cars',
  'Sedans',
  'SUVs',
  'Luxury',
];

const FULL_MAP_HEADER_HEIGHT = 68;

const mutedMapStyle: MapStyleElement[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F4F5F7' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8B94A4' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }],
  },
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
    stylers: [{ color: '#E5E8ED' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#E7EEF7' }],
  },
];

function CarsMapSurface({
  center,
  expanded,
  interactive,
  onMapPress,
  onVehiclePress,
  selectedVehicleId,
  vehicles,
}: CarsMapSurfaceProps) {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const selectedVehicle = vehicles.find(({ id }) => id === selectedVehicleId);

  useEffect(() => {
    if (!isMapReady) return;

    mapRef.current?.animateToRegion(
      {
        ...center,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      650,
    );
  }, [center.latitude, center.longitude, isMapReady]);

  useEffect(() => {
    if (!isMapReady || !selectedVehicle) return;

    mapRef.current?.animateToRegion(
      {
        ...selectedVehicle.coordinate,
        latitudeDelta: expanded ? 0.006 : 0.009,
        longitudeDelta: expanded ? 0.006 : 0.009,
      },
      450,
    );
  }, [
    expanded,
    isMapReady,
    selectedVehicle?.coordinate.latitude,
    selectedVehicle?.coordinate.longitude,
    selectedVehicle?.id,
  ]);

  return (
    <MapView
      ref={mapRef}
      customMapStyle={mutedMapStyle}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        ...center,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      loadingBackgroundColor={colors.surfaceGray}
      loadingEnabled
      loadingIndicatorColor={colors.primaryBrandBlue}
      mapPadding={
        expanded
          ? { top: 150, right: 16, bottom: 16, left: 16 }
          : { top: 48, right: 8, bottom: 84, left: 8 }
      }
      moveOnMarkerPress={false}
      onMapReady={() => setIsMapReady(true)}
      onPress={onMapPress}
      paddingAdjustmentBehavior="never"
      pitchEnabled={interactive && expanded}
      rotateEnabled={interactive && expanded}
      scrollEnabled={interactive}
      showsBuildings={false}
      showsCompass={interactive && expanded}
      showsIndoors={false}
      showsPointsOfInterests={false}
      style={StyleSheet.absoluteFill}
      toolbarEnabled={false}
      zoomEnabled={interactive}
    >
      <Circle
        center={center}
        fillColor="rgba(37, 99, 235, 0.14)"
        radius={85}
        strokeColor="rgba(37, 99, 235, 0.08)"
      />
      <Marker anchor={{ x: 0.5, y: 0.5 }} coordinate={center} zIndex={20}>
        <View style={styles.customerMarkerOuter}>
          <View style={styles.customerMarkerInner} />
        </View>
      </Marker>

      {vehicles.map((vehicle) => (
        <VehicleMapMarker
          key={vehicle.id}
          onPress={onVehiclePress}
          selected={vehicle.id === selectedVehicleId}
          vehicle={vehicle}
        />
      ))}
    </MapView>
  );
}

export function NearbyCarsMap({
  activeCategory,
  center,
  onCategoryChange,
  onInteractionChange,
  onVehiclePress,
  selectedVehicleId,
  vehicles,
}: NearbyCarsMapProps) {
  const { width } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const geocodeRequestIdRef = useRef(0);
  const [fullMapCenter, setFullMapCenter] = useState(center);
  const [fullMapSelectedVehicleId, setFullMapSelectedVehicleId] =
    useState(selectedVehicleId);
  const [isEmbeddedMapActive, setIsEmbeddedMapActive] = useState(false);
  const [isFullMapVisible, setIsFullMapVisible] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSearchError, setLocationSearchError] = useState<string>();
  const mapHeight = Math.min(460, Math.max(420, width * 1.08));
  const fullMapTopInset = Math.max(
    safeAreaInsets.top,
    initialWindowMetrics?.insets.top ?? 0,
  );
  const fullMapBottomInset = Math.max(
    safeAreaInsets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
  );
  const fullMapVehicles = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        coordinate: {
          latitude:
            fullMapCenter.latitude +
            (vehicle.coordinate.latitude - center.latitude),
          longitude:
            fullMapCenter.longitude +
            (vehicle.coordinate.longitude - center.longitude),
        },
      })),
    [
      center.latitude,
      center.longitude,
      fullMapCenter.latitude,
      fullMapCenter.longitude,
      vehicles,
    ],
  );

  useEffect(
    () => () => {
      onInteractionChange?.(false);
    },
    [onInteractionChange],
  );

  useEffect(() => {
    if (
      fullMapSelectedVehicleId &&
      !fullMapVehicles.some(({ id }) => id === fullMapSelectedVehicleId)
    ) {
      setFullMapSelectedVehicleId(undefined);
    }
  }, [fullMapSelectedVehicleId, fullMapVehicles]);

  const setEmbeddedMapInteraction = (isActive: boolean) => {
    setIsEmbeddedMapActive(isActive);
    onInteractionChange?.(isActive);
  };

  const openFullMap = () => {
    setEmbeddedMapInteraction(false);
    setFullMapCenter(center);
    setFullMapSelectedVehicleId(selectedVehicleId);
    setLocationQuery('');
    setLocationSearchError(undefined);
    setIsFullMapVisible(true);
  };

  const closeFullMap = () => {
    geocodeRequestIdRef.current += 1;
    Keyboard.dismiss();
    setIsSearchingLocation(false);
    setIsFullMapVisible(false);
  };
  const fullMapBackGestureHandlers = useScreenBackNavigation(
    closeFullMap,
    isFullMapVisible,
    false,
  );

  const searchFullMapLocation = async () => {
    const query = locationQuery.trim();

    if (!query) {
      setLocationSearchError('Enter a town, neighbourhood, or address.');
      return;
    }

    const requestId = geocodeRequestIdRef.current + 1;
    geocodeRequestIdRef.current = requestId;
    Keyboard.dismiss();
    setIsSearchingLocation(true);
    setLocationSearchError(undefined);

    try {
      if (Platform.OS === 'android') {
        let permission = await Location.getForegroundPermissionsAsync();

        if (!permission.granted && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (!permission.granted) {
          if (requestId === geocodeRequestIdRef.current) {
            setLocationSearchError(
              'Location permission is needed to search on this device.',
            );
          }
          return;
        }
      }

      const queryIncludesCountry = query.toLowerCase().includes('cameroon');
      const regionBiasedQuery = queryIncludesCountry
        ? query
        : `${query}, Cameroon`;
      let results = await Location.geocodeAsync(regionBiasedQuery);

      if (!results.length && !queryIncludesCountry) {
        results = await Location.geocodeAsync(query);
      }

      if (requestId !== geocodeRequestIdRef.current) return;

      const result = results[0];

      if (!result) {
        setLocationSearchError(
          'We could not find that location. Try adding a town or region.',
        );
        return;
      }

      setFullMapSelectedVehicleId(undefined);
      setFullMapCenter({
        latitude: result.latitude,
        longitude: result.longitude,
      });
    } catch {
      if (requestId === geocodeRequestIdRef.current) {
        setLocationSearchError(
          'Location search is unavailable right now. Please try again.',
        );
      }
    } finally {
      if (requestId === geocodeRequestIdRef.current) {
        setIsSearchingLocation(false);
      }
    }
  };

  const recenterFullMap = () => {
    geocodeRequestIdRef.current += 1;
    Keyboard.dismiss();
    setIsSearchingLocation(false);
    setLocationQuery('');
    setLocationSearchError(undefined);
    setFullMapSelectedVehicleId(undefined);
    setFullMapCenter(center);
  };

  const selectFullMapVehicle = (vehicle: Vehicle) => {
    setFullMapSelectedVehicleId(vehicle.id);
    onVehiclePress?.(vehicle);
  };

  return (
    <>
      <View style={[styles.card, { height: mapHeight }]}>
        <CarsMapSurface
          center={center}
          expanded={false}
          interactive={isEmbeddedMapActive}
          onVehiclePress={onVehiclePress}
          selectedVehicleId={selectedVehicleId}
          vehicles={vehicles}
        />

        {!isEmbeddedMapActive ? (
          <Pressable
            accessibilityHint="Activates one-finger panning and pinch zoom"
            accessibilityLabel="Activate map controls"
            accessibilityRole="button"
            onPress={() => setEmbeddedMapInteraction(true)}
            style={styles.mapActivationLayer}
          >
            <View style={styles.mapGestureHint}>
              <Ionicons
                color={colors.primaryBrandBlue}
                name="hand-left-outline"
                size={16}
              />
              <Text style={styles.mapGestureHintText}>Tap to explore map</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel="Finish interacting with map"
            accessibilityRole="button"
            onPress={() => setEmbeddedMapInteraction(false)}
            style={({ pressed }) => [
              styles.finishMapButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons color={colors.primaryBrandBlue} name="checkmark" size={17} />
            <Text style={styles.finishMapButtonText}>Done</Text>
          </Pressable>
        )}

        <View style={styles.mapSummary}>
          <View>
            <Text style={styles.summaryTitle}>Cars near you</Text>
            <Text style={styles.summaryCount}>
              {vehicles.length} {vehicles.length === 1 ? 'car' : 'cars'} found
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Open full map"
            accessibilityRole="button"
            onPress={openFullMap}
            style={({ pressed }) => [
              styles.openMapButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.openMapText}>Open map</Text>
            <Ionicons color={colors.white} name="arrow-forward" size={18} />
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={closeFullMap}
        presentationStyle="fullScreen"
        visible={isFullMapVisible}
      >
        <View
          {...fullMapBackGestureHandlers}
          style={[
            styles.fullMapSafeArea,
            { paddingBottom: fullMapBottomInset },
          ]}
        >
          <StatusBar style="dark" />
          <View
            style={[
              styles.fullMapHeader,
              {
                height: FULL_MAP_HEADER_HEIGHT + fullMapTopInset,
                paddingTop: fullMapTopInset,
              },
            ]}
          >
            <BackButton
              accessibilityLabel="Close full map"
              onPress={closeFullMap}
            />
            <View style={styles.fullMapTitleContainer}>
              <Text style={styles.fullMapTitle}>Cars near you</Text>
              <Text style={styles.fullMapSubtitle}>
                {fullMapVehicles.length}{' '}
                {fullMapVehicles.length === 1 ? 'car' : 'cars'} available
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.fullMap}>
            <CarsMapSurface
              center={fullMapCenter}
              expanded
              interactive
              onMapPress={() => Keyboard.dismiss()}
              onVehiclePress={selectFullMapVehicle}
              selectedVehicleId={fullMapSelectedVehicleId}
              vehicles={fullMapVehicles}
            />

            <View pointerEvents="box-none" style={styles.fullMapTopControls}>
              <View style={styles.locationSearchBar}>
                <Ionicons
                  color={colors.textSecondary}
                  name="location-outline"
                  size={21}
                />
                <TextInput
                  accessibilityLabel="Search map location"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isSearchingLocation}
                  onChangeText={(value) => {
                    setLocationQuery(value);
                    if (locationSearchError) setLocationSearchError(undefined);
                  }}
                  onSubmitEditing={() => void searchFullMapLocation()}
                  placeholder="Search town or neighbourhood"
                  placeholderTextColor="#8B94A4"
                  returnKeyType="search"
                  selectionColor={colors.primaryBrandBlue}
                  style={styles.locationSearchInput}
                  value={locationQuery}
                />

                {Boolean(locationQuery) && !isSearchingLocation && (
                  <Pressable
                    accessibilityLabel="Clear location search"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => {
                      setLocationQuery('');
                      setLocationSearchError(undefined);
                    }}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <Ionicons
                      color={colors.textSecondary}
                      name="close-circle"
                      size={19}
                    />
                  </Pressable>
                )}

                <Pressable
                  accessibilityLabel="Search this location"
                  accessibilityRole="button"
                  disabled={isSearchingLocation}
                  onPress={() => void searchFullMapLocation()}
                  style={({ pressed }) => [
                    styles.locationSearchButton,
                    pressed && styles.pressed,
                  ]}
                >
                  {isSearchingLocation ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Ionicons color={colors.white} name="search" size={18} />
                  )}
                </Pressable>
              </View>

              {locationSearchError && (
                <View style={styles.locationSearchError}>
                  <Ionicons
                    color={colors.error}
                    name="alert-circle-outline"
                    size={15}
                  />
                  <Text style={styles.locationSearchErrorText}>
                    {locationSearchError}
                  </Text>
                </View>
              )}

              <ScrollView
                contentContainerStyle={styles.fullMapFilterList}
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}
                style={styles.fullMapFilterScroller}
              >
                {categoryFilters.map((category) => {
                  const active = category === activeCategory;

                  return (
                    <Pressable
                      key={category}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => onCategoryChange(category)}
                      style={({ pressed }) => [
                        styles.fullMapFilterChip,
                        active && styles.activeFullMapFilterChip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.fullMapFilterText,
                          active && styles.activeFullMapFilterText,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {!fullMapVehicles.length && (
              <View pointerEvents="none" style={styles.fullMapEmptyState}>
                <View style={styles.fullMapEmptyIcon}>
                  <Ionicons
                    color={colors.primaryBrandBlue}
                    name="car-sport-outline"
                    size={25}
                  />
                </View>
                <View>
                  <Text style={styles.fullMapEmptyTitle}>No cars found</Text>
                  <Text style={styles.fullMapEmptyText}>
                    Try another vehicle category.
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              accessibilityHint="Returns the map to your current area"
              accessibilityLabel="Recenter map"
              accessibilityRole="button"
              onPress={recenterFullMap}
              style={({ pressed }) => [
                styles.recenterButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                color={colors.primaryBrandBlue}
                name="locate"
                size={23}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: colors.surfaceGray,
  },
  customerMarkerOuter: {
    width: 30,
    height: 30,
    borderWidth: 7,
    borderColor: 'rgba(147, 197, 253, 0.55)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  customerMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  mapActivationLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
  },
  mapGestureHint: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  mapGestureHintText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  finishMapButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  finishMapButtonText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  mapSummary: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    left: 14,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCount: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  openMapButton: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 20,
    backgroundColor: colors.primaryBrandBlue,
    paddingHorizontal: 16,
  },
  openMapText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  fullMapSafeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  fullMapHeader: {
    zIndex: 2,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderGray,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  fullMapTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  fullMapTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  fullMapSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  headerSpacer: {
    width: 38,
  },
  fullMap: {
    flex: 1,
  },
  fullMapTopControls: {
    position: 'absolute',
    top: 14,
    right: 16,
    left: 16,
  },
  locationSearchBar: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 227, 236, 0.8)',
    borderRadius: 17,
    backgroundColor: colors.white,
    paddingLeft: 15,
    paddingRight: 7,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 7,
  },
  locationSearchInput: {
    flex: 1,
    minWidth: 0,
    height: 54,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  locationSearchButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
  },
  locationSearchError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.22)',
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    paddingHorizontal: 11,
    paddingVertical: 9,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  locationSearchErrorText: {
    flex: 1,
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  fullMapFilterScroller: {
    flexGrow: 0,
    marginHorizontal: -16,
    marginTop: 11,
  },
  fullMapFilterList: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  fullMapFilterChip: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    paddingHorizontal: 17,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activeFullMapFilterChip: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  fullMapFilterText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  activeFullMapFilterText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  fullMapEmptyState: {
    position: 'absolute',
    top: 178,
    right: 20,
    left: 20,
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    elevation: 5,
  },
  fullMapEmptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  fullMapEmptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  fullMapEmptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.17,
    shadowRadius: 8,
    elevation: 6,
  },
});

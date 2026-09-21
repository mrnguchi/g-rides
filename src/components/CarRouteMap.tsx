import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, {
  Circle,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type MapStyleElement,
} from 'react-native-maps';

import {
  getRoutePreview,
  type RoutePreview,
} from '../services/routePreviewService';
import { colors, fonts } from '../theme';
import type { Coordinate, Vehicle } from '../types/map';

const logo = require('../../assets/images/logo-blue.png');

const mutedMapStyle: MapStyleElement[] = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F4F5F7' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7E8797' }],
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

type CarRouteMapProps = {
  destination: Coordinate;
  onInteractionChange?: (isActive: boolean) => void;
  origin: Coordinate;
  vehicle: Vehicle;
};

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.max(10, Math.round(distanceMeters / 10) * 10)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function useFreezeMarker() {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return tracksViewChanges;
}

function OriginMarker({ coordinate }: { coordinate: Coordinate }) {
  const tracksViewChanges = useFreezeMarker();

  return (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={coordinate}
      tracksViewChanges={tracksViewChanges}
      zIndex={30}
    >
      <View collapsable={false} style={styles.originMarkerGlow}>
        <View style={styles.originMarker}>
          <Ionicons color={colors.white} name="navigate" size={20} />
        </View>
      </View>
    </Marker>
  );
}

function DestinationMarker({
  coordinate,
  vehicle,
}: {
  coordinate: Coordinate;
  vehicle: Vehicle;
}) {
  const tracksViewChanges = useFreezeMarker();

  return (
    <Marker
      anchor={{ x: 0.5, y: 1 }}
      coordinate={coordinate}
      tracksViewChanges={tracksViewChanges}
      zIndex={40}
    >
      <View collapsable={false} style={styles.destinationMarkerContainer}>
        <View style={styles.vehicleMapLabel}>
          <Text numberOfLines={1} style={styles.vehicleMapName}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.vehicleMapAvailability}>
            {vehicle.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
        <View style={styles.vehicleMapLabelTail} />
        <View style={styles.destinationPin}>
          <Ionicons color={colors.white} name="car-sport" size={20} />
        </View>
        <View style={styles.destinationPinTip} />
      </View>
    </Marker>
  );
}

export function CarRouteMap({
  destination,
  onInteractionChange,
  origin,
  vehicle,
}: CarRouteMapProps) {
  const { width } = useWindowDimensions();
  const mapRef = useRef<MapView>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [route, setRoute] = useState<RoutePreview>();
  const mapHeight = Math.min(540, Math.max(500, width * 1.22));

  useEffect(() => {
    let isActive = true;
    setRoute(undefined);

    getRoutePreview({ destination, origin }).then((preview) => {
      if (isActive) setRoute(preview);
    });

    return () => {
      isActive = false;
    };
  }, [
    destination.latitude,
    destination.longitude,
    origin.latitude,
    origin.longitude,
  ]);

  useEffect(
    () => () => {
      onInteractionChange?.(false);
    },
    [onInteractionChange],
  );

  const fitRoute = (animated = true) => {
    if (!isMapReady || !route) return;

    mapRef.current?.fitToCoordinates(route.coordinates, {
      animated,
      edgePadding: {
        top: 110,
        right: 64,
        bottom: 105,
        left: 64,
      },
    });
  };

  useEffect(() => {
    if (isMapReady && route) fitRoute(false);
  }, [isMapReady, route]);

  const setInteraction = (isActive: boolean) => {
    setIsInteractive(isActive);
    onInteractionChange?.(isActive);
  };

  const zoomMap = async (amount: number) => {
    const camera = await mapRef.current?.getCamera();
    if (!camera) return;

    mapRef.current?.animateCamera(
      {
        zoom: Math.min(20, Math.max(2, (camera.zoom ?? 15) + amount)),
      },
      { duration: 250 },
    );
  };

  const focusOrigin = () => {
    mapRef.current?.animateToRegion(
      {
        ...origin,
        latitudeDelta: 0.007,
        longitudeDelta: 0.007,
      },
      400,
    );
  };

  const initialLatitudeDelta = Math.max(
    0.008,
    Math.abs(destination.latitude - origin.latitude) * 2.2,
  );
  const initialLongitudeDelta = Math.max(
    0.008,
    Math.abs(destination.longitude - origin.longitude) * 2.2,
  );

  return (
    <View style={[styles.card, { height: mapHeight }]}>
      <MapView
        ref={mapRef}
        customMapStyle={mutedMapStyle}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: initialLatitudeDelta,
          longitudeDelta: initialLongitudeDelta,
        }}
        loadingBackgroundColor={colors.surfaceGray}
        loadingEnabled
        loadingIndicatorColor={colors.primaryBrandBlue}
        mapPadding={{ top: 92, right: 16, bottom: 82, left: 16 }}
        moveOnMarkerPress={false}
        onMapReady={() => setIsMapReady(true)}
        paddingAdjustmentBehavior="never"
        pitchEnabled={false}
        provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        scrollEnabled={isInteractive}
        showsBuildings={false}
        showsCompass={false}
        showsIndoors={false}
        showsPointsOfInterest
        style={StyleSheet.absoluteFill}
        toolbarEnabled={false}
        zoomEnabled={isInteractive}
      >
        <Circle
          center={origin}
          fillColor="rgba(37, 99, 235, 0.12)"
          radius={65}
          strokeColor="rgba(37, 99, 235, 0.06)"
        />

        {route && (
          <>
            <Polyline
              coordinates={route.coordinates}
              lineCap="round"
              lineJoin="round"
              strokeColor="rgba(255, 255, 255, 0.96)"
              strokeWidth={9}
              zIndex={10}
            />
            <Polyline
              coordinates={route.coordinates}
              lineCap="round"
              lineJoin="round"
              strokeColor="#1769E8"
              strokeWidth={5}
              zIndex={11}
            />
          </>
        )}

        <OriginMarker coordinate={origin} />
        <DestinationMarker coordinate={destination} vehicle={vehicle} />
      </MapView>

      {!isInteractive && (
        <Pressable
          accessibilityHint="Activates one-finger panning and pinch zoom"
          accessibilityLabel="Activate route map controls"
          accessibilityRole="button"
          onPress={() => setInteraction(true)}
          style={styles.activationLayer}
        >
          <View style={styles.mapGestureHint}>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="hand-left-outline"
              size={15}
            />
            <Text style={styles.mapGestureHintText}>Tap to explore route</Text>
          </View>
        </Pressable>
      )}

      <View style={styles.instructionCard}>
        <View style={styles.turnIconContainer}>
          <Ionicons
            color={colors.primaryBrandBlue}
            name="arrow-redo"
            size={25}
          />
        </View>
        <View style={styles.instructionTextContainer}>
          <Text style={styles.instructionTitle}>Route to vehicle</Text>
          <Text numberOfLines={1} style={styles.instructionText}>
            {route?.instruction ?? 'Calculating route…'}
          </Text>
          {route && (
            <Text style={styles.instructionDistance}>
              In {formatDistance(route.instructionDistanceMeters)}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        accessibilityLabel="Center map on your location"
        accessibilityRole="button"
        onPress={focusOrigin}
        style={({ pressed }) => [
          styles.locateButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          color={colors.primaryBrandBlue}
          name="locate-outline"
          size={22}
        />
      </Pressable>

      <View style={styles.zoomControls}>
        <Pressable
          accessibilityLabel="Zoom in"
          accessibilityRole="button"
          onPress={() => void zoomMap(1)}
          style={({ pressed }) => [
            styles.zoomButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons color={colors.textPrimary} name="add" size={19} />
        </Pressable>
        <View style={styles.zoomDivider} />
        <Pressable
          accessibilityLabel="Zoom out"
          accessibilityRole="button"
          onPress={() => void zoomMap(-1)}
          style={({ pressed }) => [
            styles.zoomButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons color={colors.textPrimary} name="remove" size={19} />
        </Pressable>
      </View>

      {isInteractive && (
        <Pressable
          accessibilityLabel="Finish interacting with route map"
          accessibilityRole="button"
          onPress={() => setInteraction(false)}
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={colors.primaryBrandBlue}
            name="checkmark"
            size={16}
          />
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      )}

      <View style={styles.brandCard}>
        <View style={styles.brandLogoContainer}>
          <Image source={logo} style={styles.brandLogo} />
        </View>
        <View>
          <Text style={styles.brandName}>G-RIDES</Text>
          <Text style={styles.brandTagline}>Vehicle Location</Text>
        </View>
      </View>

      <View style={styles.etaCard}>
        {route ? (
          <>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="time-outline"
              size={18}
            />
            <View style={styles.etaTextContainer}>
              <Text style={styles.etaValue}>
                {route.durationMinutes} min ·{' '}
                {formatDistance(route.distanceMeters)}
              </Text>
              <Text style={styles.etaLabel}>Route preview</Text>
            </View>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="car-sport"
              size={18}
            />
          </>
        ) : (
          <ActivityIndicator color={colors.primaryBrandBlue} size="small" />
        )}
      </View>

      <Pressable
        accessibilityLabel="Fit the full route on map"
        accessibilityRole="button"
        onPress={() => fitRoute()}
        style={({ pressed }) => [
          styles.routeButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          color={colors.primaryBrandBlue}
          name="navigate"
          size={24}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: colors.surfaceGray,
    marginTop: 29,
  },
  originMarkerGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(147, 197, 253, 0.36)',
  },
  originMarker: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1769E8',
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationMarkerContainer: {
    width: 132,
    height: 96,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  vehicleMapLabel: {
    zIndex: 3,
    width: 126,
    minHeight: 39,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  vehicleMapName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
  },
  vehicleMapAvailability: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 8,
    fontWeight: '500',
    marginTop: 2,
  },
  vehicleMapLabelTail: {
    zIndex: 2,
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.white,
    marginTop: -6,
  },
  destinationPin: {
    zIndex: 3,
    width: 38,
    height: 38,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
    marginTop: -1,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  destinationPinTip: {
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.primaryBrandBlue,
    marginTop: -8,
  },
  activationLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGestureHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.13,
    shadowRadius: 7,
    elevation: 4,
  },
  mapGestureHintText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  instructionCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 188,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 11,
    paddingVertical: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  turnIconContainer: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionTextContainer: {
    minWidth: 0,
    flex: 1,
  },
  instructionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  instructionText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8,
    marginTop: 2,
  },
  instructionDistance: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 8,
    fontWeight: '500',
    marginTop: 3,
  },
  locateButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 5,
  },
  zoomControls: {
    position: 'absolute',
    right: 12,
    top: '58%',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderGray,
    marginHorizontal: 6,
  },
  doneButton: {
    position: 'absolute',
    top: 62,
    right: 12,
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 11,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.13,
    shadowRadius: 5,
    elevation: 4,
  },
  doneButtonText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    fontWeight: '600',
  },
  brandCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    minWidth: 118,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 9,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 4,
  },
  brandLogoContainer: {
    width: 28,
    height: 28,
    overflow: 'hidden',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: colors.primaryDark,
  },
  brandLogo: {
    width: 29,
    height: 25,
    resizeMode: 'contain',
  },
  brandName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
  },
  brandTagline: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8,
    marginTop: 1,
  },
  etaCard: {
    position: 'absolute',
    right: 62,
    bottom: 12,
    minWidth: 148,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 9,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 4,
  },
  etaTextContainer: {
    minWidth: 0,
  },
  etaValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
  },
  etaLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    marginTop: 2,
  },
  routeButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 5,
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.97 }],
  },
});

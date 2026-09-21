import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';

import { colors, fonts } from '../theme';
import type { Vehicle } from '../types/map';

type VehicleMapMarkerProps = {
  onPress?: (vehicle: Vehicle) => void;
  selected: boolean;
  vehicle: Vehicle;
};

const MARKER_SETTLE_TIME_MS = 450;

export const VehicleMapMarker = memo(function VehicleMapMarker({
  onPress,
  selected,
  vehicle,
}: VehicleMapMarkerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    setTracksViewChanges(true);

    if (!imageReady) return undefined;

    // A custom native map marker is a snapshot. Let the image/style settle
    // before freezing that snapshot so a partially loaded marker cannot stick.
    const settleTimer = setTimeout(() => {
      setTracksViewChanges(false);
    }, MARKER_SETTLE_TIME_MS);

    return () => clearTimeout(settleTimer);
  }, [imageFailed, imageReady, selected]);

  const handleImageError = () => {
    setImageFailed(true);
    setImageReady(true);
  };

  return (
    <Marker
      anchor={{ x: 0.5, y: 1 }}
      coordinate={vehicle.coordinate}
      identifier={`vehicle-${vehicle.id}`}
      onPress={() => onPress?.(vehicle)}
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 30 : 10}
    >
      <View
        collapsable={false}
        style={styles.pin}
      >
        <View
          style={[styles.pinTail, selected && styles.selectedPinTail]}
        />
        <View
          style={[styles.pinHead, selected && styles.selectedPinHead]}
        >
          {imageFailed ? (
            <Ionicons
              color={colors.primaryBrandBlue}
              name="car-sport"
              size={selected ? 31 : 28}
            />
          ) : (
            <Image
              accessibilityIgnoresInvertColors
              onError={handleImageError}
              onLoad={() => setImageReady(true)}
              resizeMode="contain"
              source={vehicle.markerImage}
              style={[
                styles.vehicleImage,
                selected && styles.selectedVehicleImage,
              ]}
            />
          )}
        </View>
      </View>

      <Callout onPress={() => onPress?.(vehicle)} tooltip>
        <View style={styles.callout}>
          <Text numberOfLines={1} style={styles.calloutModel}>
            {vehicle.model}
          </Text>
          <Text style={styles.calloutMeta}>
            {vehicle.pricePerDayXaf.toLocaleString('en-US')} XAF/day ·{' '}
            {vehicle.distanceKm} km
          </Text>
        </View>
      </Callout>
    </Marker>
  );
});

const styles = StyleSheet.create({
  pin: {
    width: 68,
    height: 74,
    alignItems: 'center',
  },
  pinTail: {
    position: 'absolute',
    bottom: 4,
    width: 21,
    height: 21,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: colors.primaryBrandBlue,
    borderBottomRightRadius: 4,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedPinTail: {
    borderRightWidth: 3,
    borderBottomWidth: 3,
    backgroundColor: '#EFF6FF',
  },
  pinHead: {
    zIndex: 2,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.primaryBrandBlue,
    borderRadius: 30,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedPinHead: {
    borderWidth: 3,
    backgroundColor: '#EFF6FF',
    shadowOpacity: 0.28,
    elevation: 7,
  },
  vehicleImage: {
    width: 50,
    height: 39,
  },
  selectedVehicleImage: {
    width: 52,
    height: 41,
  },
  callout: {
    minWidth: 156,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 5,
  },
  calloutModel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  calloutMeta: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
});

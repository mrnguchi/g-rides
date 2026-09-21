import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';
import type { UserVehicle } from '../types/vehicle';

type GarageVehicleCardProps = {
  onDocuments: () => void;
  onEdit?: () => void;
  vehicle: UserVehicle;
};

const fallbackVehicleImage = require('../../assets/images/car-2.jpeg');
const fuelIcon = require('../../assets/images/fuel-pump.png');
const mileageIcon = require('../../assets/images/speedometer.png');
const transmissionIcon = require('../../assets/images/transmission.png');
const verificationIcon = require('../../assets/images/verified-user.png');

function labelFromValue(value: string) {
  return value
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

export function GarageVehicleCard({
  onDocuments,
  onEdit,
  vehicle,
}: GarageVehicleCardProps) {
  const verifiedDocuments = vehicle.documents.filter(
    (document) => document.status === 'verified',
  ).length;
  const needsAttention = vehicle.documents.some(
    (document) => document.status === 'expired',
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          resizeMode="cover"
          source={vehicle.image ?? fallbackVehicleImage}
          style={styles.vehicleImage}
        />

        <View style={styles.vehicleCopy}>
          <View style={styles.badgeRow}>
            <View style={styles.relationshipBadge}>
              <Text style={styles.relationshipText}>
                {labelFromValue(vehicle.relationship)}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                vehicle.status === 'active'
                  ? styles.activeDot
                  : styles.pendingDot,
              ]}
            />
          </View>
          <Text numberOfLines={1} style={styles.vehicleName}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.vehicleYear}>{vehicle.year} · {vehicle.category}</Text>
          <View style={styles.registrationPill}>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="card-outline"
              size={14}
            />
            <Text style={styles.registrationText}>
              {vehicle.registrationNumber}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Image source={mileageIcon} style={styles.metaIcon} />
          <Text style={styles.metaValue}>
            {vehicle.mileageKm
              ? `${vehicle.mileageKm.toLocaleString('en-US')} km`
              : 'Mileage not set'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Image source={fuelIcon} style={styles.metaIcon} />
          <Text style={styles.metaValue}>{labelFromValue(vehicle.fuelType)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Image source={transmissionIcon} style={styles.metaIcon} />
          <Text style={styles.metaValue}>
            {labelFromValue(vehicle.transmission)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onDocuments}
          style={({ pressed }) => [
            styles.documentSummary,
            pressed && styles.pressed,
          ]}
        >
          <View
            style={[
              styles.documentIconContainer,
              needsAttention && styles.documentIconAttention,
            ]}
          >
            <Image source={verificationIcon} style={styles.documentIcon} />
          </View>
          <View style={styles.documentCopy}>
            <Text style={styles.documentTitle}>Vehicle documents</Text>
            <Text
              style={[
                styles.documentStatus,
                needsAttention && styles.documentStatusAttention,
              ]}
            >
              {needsAttention
                ? 'Needs attention'
                : `${verifiedDocuments} verified · ${vehicle.documents.length} total`}
            </Text>
          </View>
          <Ionicons
            color={colors.primaryBrandBlue}
            name="chevron-forward"
            size={19}
          />
        </Pressable>

        {onEdit && (
          <Pressable
            accessibilityLabel={`Edit ${vehicle.make} ${vehicle.model}`}
            accessibilityRole="button"
            onPress={onEdit}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={colors.primaryBrandBlue}
              name="create-outline"
              size={19}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 11,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    gap: 13,
  },
  vehicleImage: {
    width: 126,
    height: 105,
    borderRadius: 14,
    backgroundColor: colors.surfaceGray,
  },
  vehicleCopy: {
    minWidth: 0,
    flex: 1,
    paddingVertical: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relationshipBadge: {
    borderRadius: 10,
    backgroundColor: '#EDF4FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  relationshipText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: colors.success,
  },
  pendingDot: {
    backgroundColor: colors.warning,
  },
  vehicleName: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  vehicleYear: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    marginTop: 4,
  },
  registrationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    backgroundColor: colors.surfaceGray,
    paddingHorizontal: 7,
    paddingVertical: 5,
    marginTop: 9,
  },
  registrationText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 9.5,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 13,
  },
  metaItem: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 10,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  metaIcon: {
    width: 16,
    height: 16,
    tintColor: colors.primaryBrandBlue,
  },
  metaValue: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF0F4',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  documentSummary: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIconContainer: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#EAF7EF',
  },
  documentIconAttention: {
    backgroundColor: '#FFF6E5',
  },
  documentIcon: {
    width: 19,
    height: 19,
    tintColor: colors.primaryBrandBlue,
  },
  documentCopy: {
    minWidth: 0,
    flex: 1,
    marginLeft: 9,
  },
  documentTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
  },
  documentStatus: {
    color: colors.success,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    marginTop: 2,
  },
  documentStatusAttention: {
    color: colors.warning,
  },
  editButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#EDF4FE',
  },
  pressed: {
    opacity: 0.64,
  },
});


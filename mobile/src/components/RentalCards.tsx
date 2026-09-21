import type { ImageSourcePropType } from 'react-native';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';
import type { RentalRecord, RentalStatus } from '../types/rental';
import { LocationIcon } from './LocationIcon';

const calendarIcon = require('../../assets/images/calendar (1).png');
const extendIcon = require('../../assets/images/extend rental.png');
const canceledIcon = require('../../assets/images/forbidden.png');
const completedIcon = require('../../assets/images/check-mark.png');
const copyIcon = require('../../assets/images/copy.png');
const driverIcon = require('../../assets/images/driver.png');
const durationIcon = require('../../assets/images/time-left.png');
const insuredIcon = require('../../assets/images/check-mark.png');
const locationIcon = require('../../assets/images/location (1).png');
const pickupIcon = require('../../assets/images/fast-delivery.png');
const reportIcon = require('../../assets/images/report issue.png');
const returnIcon = require('../../assets/images/car (1).png');
const walletIcon = require('../../assets/images/wallet.png');

const statusDetails: Record<
  RentalStatus,
  { background: string; color: string; label: string }
> = {
  active: { background: '#EAF7EF', color: colors.success, label: 'Active' },
  canceled: { background: '#FDECEC', color: colors.error, label: 'Canceled' },
  completed: {
    background: '#EDF4FE',
    color: colors.primaryBrandBlue,
    label: 'Completed',
  },
  confirmed: {
    background: '#EDF4FE',
    color: colors.primaryBrandBlue,
    label: 'Confirmed',
  },
};

type AssetIconProps = {
  size?: number;
  source: ImageSourcePropType;
};

function AssetIcon({ size = 16, source }: AssetIconProps) {
  return (
    <Image
      resizeMode="contain"
      source={source}
      style={{ height: size, tintColor: colors.primaryBrandBlue, width: size }}
    />
  );
}

type RentalMetaItemProps = {
  icon: ImageSourcePropType;
  label: string;
  value: string;
};

function RentalMetaItem({ icon, label, value }: RentalMetaItemProps) {
  return (
    <View style={styles.metaItem}>
      <AssetIcon size={25} source={icon} />
      <View style={styles.metaCopy}>
        <Text numberOfLines={2} style={styles.metaLabel}>
          {label}
        </Text>
        <Text numberOfLines={2} style={styles.metaValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type RentalDetailItemProps = RentalMetaItemProps & {
  helper?: string;
};

function RentalDetailItem({ helper, icon, label, value }: RentalDetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <AssetIcon size={31} source={icon} />
      <View style={styles.detailCopy}>
        <Text numberOfLines={1} style={styles.detailLabel}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.detailValue}>
          {value}
        </Text>
        {helper && (
          <Text numberOfLines={1} style={styles.detailHelper}>
            {helper}
          </Text>
        )}
      </View>
    </View>
  );
}

type ActiveRentalCardProps = {
  countdown: string;
  onAction: (action: 'extend' | 'report' | 'return') => void;
  rental: RentalRecord;
};

export function ActiveRentalCard({
  countdown,
  onAction,
  rental,
}: ActiveRentalCardProps) {
  const status = statusDetails[rental.status];

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeTopRow}>
        <View style={styles.activeTopCopy}>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text numberOfLines={2} style={styles.activeVehicleName}>
            {rental.vehicle.brand} {rental.vehicle.model}
          </Text>
          <Text style={styles.activeVehicleSubtitle}>{rental.vehicle.category}</Text>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceText}>ID: {rental.bookingReference}</Text>
            <Image source={copyIcon} style={styles.copyIcon} />
          </View>
        </View>

        <Image
          resizeMode="cover"
          source={rental.vehicle.image}
          style={styles.activeVehicleImage}
        />
      </View>

      <View style={styles.countdownCard}>
        <AssetIcon size={27} source={durationIcon} />
        <View>
          <Text style={styles.countdownLabel}>Rental ends in</Text>
          <Text style={styles.countdownValue}>{countdown}</Text>
          <Text style={styles.countdownDate}>
            {rental.endDate} at {rental.endTime}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <RentalMetaItem
          icon={pickupIcon}
          label="Pickup type"
          value={rental.pickupType}
        />
        <RentalMetaItem
          icon={locationIcon}
          label="Pickup location"
          value={rental.pickupLocation}
        />
        <RentalMetaItem
          icon={walletIcon}
          label="Total paid + Deposit"
          value={`${rental.totalPaidXaf.toLocaleString('en-US')}XAF`}
        />
      </View>

      <View style={styles.detailsGrid}>
        <RentalDetailItem
          helper={rental.pickupTime}
          icon={calendarIcon}
          label="Pickup date"
          value={rental.pickupDate}
        />
        <RentalDetailItem
          helper={rental.endTime}
          icon={calendarIcon}
          label="Return date"
          value={rental.endDate}
        />
        <RentalDetailItem
          icon={durationIcon}
          label="Duration"
          value={rental.durationLabel}
        />
        <RentalDetailItem
          helper="Held"
          icon={walletIcon}
          label="Deposit"
          value={`${rental.depositXaf.toLocaleString('en-US')} XAF`}
        />
        <RentalDetailItem
          icon={driverIcon}
          label="Driver"
          value={rental.driver}
        />
        <RentalDetailItem
          icon={insuredIcon}
          label="Insured"
          value={rental.insured}
        />
      </View>

      <View style={styles.actionRow}>
        <RentalActionButton
          icon={extendIcon}
          label="Extend rental"
          onPress={() => onAction('extend')}
          primary
        />
        <RentalActionButton
          icon={reportIcon}
          label="Report issue"
          onPress={() => onAction('report')}
        />
        <RentalActionButton
          icon={returnIcon}
          label="Return vehicle"
          onPress={() => onAction('return')}
        />
      </View>
    </View>
  );
}

type RentalActionButtonProps = {
  icon: ImageSourcePropType;
  label: string;
  onPress: () => void;
  primary?: boolean;
};

function RentalActionButton({
  icon,
  label,
  onPress,
  primary = false,
}: RentalActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.primaryActionButton,
        pressed && styles.pressed,
      ]}
    >
      <Image
        resizeMode="contain"
        source={icon}
        style={[
          styles.actionIcon,
          {
            tintColor: primary ? colors.white : colors.primaryBrandBlue,
          },
        ]}
      />
      <Text
        numberOfLines={1}
        style={[styles.actionText, primary && styles.primaryActionText]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type RentalSummaryCardProps = {
  onPress?: () => void;
  rental: RentalRecord;
};

export function RentalSummaryCard({ onPress, rental }: RentalSummaryCardProps) {
  const status = statusDetails[rental.status];
  const statusIcon =
    rental.status === 'canceled'
      ? canceledIcon
      : rental.status === 'completed'
        ? completedIcon
        : calendarIcon;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]}
    >
      <Image
        resizeMode="cover"
        source={rental.vehicle.image}
        style={styles.summaryImage}
      />
      <View style={styles.summaryContent}>
        <View style={styles.summaryTitleRow}>
          <Text numberOfLines={1} style={styles.summaryTitle}>
            {rental.vehicle.model}
          </Text>
          <View style={[styles.smallStatusBadge, { backgroundColor: status.background }]}>
            <Image
              source={statusIcon}
              style={[styles.smallStatusIcon, { tintColor: status.color }]}
            />
            <Text style={[styles.smallStatusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.summarySchedule}>
          {rental.status === 'confirmed'
            ? `Starts on ${rental.startDate} at ${rental.startTime}`
            : `${rental.startDate} – ${rental.endDate}`}
        </Text>
        <View style={styles.summaryBottomRow}>
          <View style={styles.summaryLocation}>
            <LocationIcon size={16} />
            <Text numberOfLines={1} style={styles.summaryLocationText}>
              {rental.pickupLocation}
            </Text>
          </View>
          <View style={styles.summaryPriceRow}>
            <Text style={styles.summaryPrice}>
              {rental.vehicle.pricePerDayXaf.toLocaleString('en-US')}XAF
            </Text>
            <Text style={styles.summaryPerDay}>/day</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  activeTopRow: {
    minHeight: 132,
    flexDirection: 'row',
    gap: 10,
  },
  activeTopCopy: {
    flex: 1,
    paddingTop: 1,
  },
  statusBadge: {
    height: 24,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 9,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  activeVehicleName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16.5,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 11,
  },
  activeVehicleSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
  },
  referenceText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  copyIcon: {
    width: 14,
    height: 14,
    tintColor: colors.textSecondary,
  },
  activeVehicleImage: {
    width: '50%',
    height: 132,
    borderRadius: 11,
    backgroundColor: colors.surfaceGray,
  },
  countdownCard: {
    minHeight: 78,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    backgroundColor: '#EDF3FA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 13,
  },
  countdownLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  countdownValue: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  countdownDate: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  metaItem: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  metaCopy: {
    minWidth: 0,
    flex: 1,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 12,
    minHeight: 24,
  },
  metaValue: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 12,
    marginTop: 22,
  },
  detailItem: {
    width: '33.333%',
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 7,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  detailCopy: {
    minWidth: 0,
    width: '100%',
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 14,
    textAlign: 'center',
  },
  detailValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 5,
  },
  detailHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
  },
  actionButton: {
    height: 45,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 9,
    backgroundColor: '#EDF4FE',
    paddingHorizontal: 5,
  },
  primaryActionButton: {
    backgroundColor: colors.primaryBrandBlue,
  },
  actionText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  primaryActionText: {
    color: colors.white,
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  summaryCard: {
    minHeight: 128,
    flexDirection: 'row',
    gap: 12,
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 8,
    marginBottom: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryImage: {
    width: 112,
    height: 112,
    borderRadius: 10,
    backgroundColor: colors.surfaceGray,
  },
  summaryContent: {
    minWidth: 0,
    flex: 1,
    paddingTop: 3,
    paddingRight: 3,
    paddingBottom: 4,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 5,
  },
  summaryTitle: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  smallStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  smallStatusIcon: {
    width: 10,
    height: 10,
  },
  smallStatusText: {
    fontFamily: fonts.medium,
    fontSize: 8.5,
    fontWeight: '500',
  },
  summarySchedule: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 12,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 'auto',
  },
  summaryLocation: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryLocationText: {
    minWidth: 0,
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  summaryPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  summaryPrice: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  summaryPerDay: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    marginLeft: 2,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }],
  },
});

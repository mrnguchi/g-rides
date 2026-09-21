import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BackButton,
  LocationIcon,
  PaymentMethodSheet,
  type PaymentMethod,
} from '../components';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { RentalRecord, RentalStatus } from '../types/rental';

type RentalDetailsScreenProps = {
  onBack?: () => void;
  onContactSupport?: () => void;
  onFindCars?: () => void;
  onManageRental?: () => void;
  onMessageOwner?: () => void;
  onViewCar?: () => void;
  rental: RentalRecord;
};

type StatusPresentation = {
  actionLabel: string;
  background: string;
  color: string;
  description: string;
  icon: ImageSourcePropType;
  label: string;
  title: string;
};

const calendarIcon = require('../../assets/images/calendar (1).png');
const carIcon = require('../../assets/images/car (1).png');
const canceledIcon = require('../../assets/images/forbidden.png');
const completedIcon = require('../../assets/images/check-mark.png');
const deliveryIcon = require('../../assets/images/fast-delivery.png');
const driverIcon = require('../../assets/images/driver.png');
const durationIcon = require('../../assets/images/time-left.png');
const logoBlue = require('../../assets/images/logo-blue.png');
const ownerImage = require('../../assets/images/10007.png');
const walletIcon = require('../../assets/images/wallet.png');

const statusPresentation: Record<RentalStatus, StatusPresentation> = {
  active: {
    actionLabel: 'Manage rental',
    background: '#EAF7EF',
    color: colors.success,
    description:
      'Your rental is currently in progress. You can extend it, report an issue, or begin the return process.',
    icon: durationIcon,
    label: 'Active',
    title: 'Rental in progress',
  },
  canceled: {
    actionLabel: 'Find another car',
    background: '#FDECEC',
    color: colors.error,
    description:
      'This booking was canceled. Review the cancellation and refund information below.',
    icon: canceledIcon,
    label: 'Canceled',
    title: 'Booking canceled',
  },
  completed: {
    actionLabel: 'Rate your rental',
    background: '#EDF4FE',
    color: colors.primaryBrandBlue,
    description:
      'This rental has been completed successfully. Your receipt and final payment summary are available below.',
    icon: completedIcon,
    label: 'Completed',
    title: 'Rental completed',
  },
  confirmed: {
    actionLabel: 'Proceed to payment',
    background: '#EDF4FE',
    color: colors.primaryBrandBlue,
    description:
      'The car owner accepted your request. Complete payment to secure the vehicle and receive pickup instructions.',
    icon: completedIcon,
    label: 'Confirmed',
    title: 'Your request was accepted',
  },
};

type DetailCellProps = {
  helper?: string;
  icon: ImageSourcePropType;
  label: string;
  value: string;
};

function DetailCell({ helper, icon, label, value }: DetailCellProps) {
  return (
    <View style={styles.detailCell}>
      <View style={styles.detailIconContainer}>
        <Image resizeMode="contain" source={icon} style={styles.detailIcon} />
      </View>
      <View style={styles.detailCellCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text numberOfLines={2} style={styles.detailValue}>
          {value}
        </Text>
        {helper && <Text style={styles.detailHelper}>{helper}</Text>}
      </View>
    </View>
  );
}

type PaymentRowProps = {
  emphasized?: boolean;
  label: string;
  value: string;
  valueColor?: string;
};

function PaymentRow({
  emphasized = false,
  label,
  value,
  valueColor,
}: PaymentRowProps) {
  return (
    <View style={[styles.paymentRow, emphasized && styles.totalPaymentRow]}>
      <Text style={[styles.paymentLabel, emphasized && styles.totalPaymentLabel]}>
        {label}
      </Text>
      <Text
        style={[
          styles.paymentValue,
          emphasized && styles.totalPaymentValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString('en-US')} XAF`;
}

export function RentalDetailsScreen({
  onBack,
  onContactSupport,
  onFindCars,
  onManageRental,
  onMessageOwner,
  onViewCar,
  rental,
}: RentalDetailsScreenProps) {
  const [notice, setNotice] = useState<string>();
  const [isPaymentSheetVisible, setIsPaymentSheetVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const presentation = statusPresentation[rental.status];
  const amountDue = rental.totalPaidXaf + rental.depositXaf;

  const paymentRows = useMemo(() => {
    if (rental.status === 'confirmed') {
      return [
        { label: 'Rental amount', value: formatMoney(rental.totalPaidXaf) },
        { label: 'Security deposit', value: formatMoney(rental.depositXaf) },
        { label: 'Payment status', value: 'Payment required' },
        { label: 'Amount due', value: formatMoney(amountDue), emphasized: true },
      ];
    }

    if (rental.status === 'completed') {
      return [
        { label: 'Rental total', value: formatMoney(rental.totalPaidXaf) },
        { label: 'Security deposit', value: formatMoney(rental.depositXaf) },
        { label: 'Deposit outcome', value: 'Returned' },
        { label: 'Payment status', value: 'Paid in full', emphasized: true },
      ];
    }

    if (rental.status === 'canceled') {
      return [
        { label: 'Amount charged', value: formatMoney(rental.totalPaidXaf) },
        { label: 'Security deposit', value: formatMoney(rental.depositXaf) },
        { label: 'Refund status', value: 'No payment collected' },
        { label: 'Balance due', value: '0 XAF', emphasized: true },
      ];
    }

    return [
      { label: 'Total paid', value: formatMoney(rental.totalPaidXaf) },
      { label: 'Security deposit', value: formatMoney(rental.depositXaf) },
      { label: 'Deposit status', value: 'Held securely' },
      { label: 'Payment status', value: 'Paid in full', emphasized: true },
    ];
  }, [amountDue, rental.depositXaf, rental.status, rental.totalPaidXaf]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(undefined), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleBack = () => {
    if (isPaymentSheetVisible) {
      setIsPaymentSheetVisible(false);
      return;
    }

    onBack?.();
  };
  const backGestureHandlers = useScreenBackNavigation(handleBack);

  const completePaymentMethodSelection = (method: PaymentMethod) => {
    setIsPaymentSheetVisible(false);
    setNotice(
      method === 'mtnMomo'
        ? 'MTN MoMo selected. The secure payment form will open next.'
        : 'Orange Money selected. The secure payment form will open next.',
    );
  };

  const handlePrimaryAction = () => {
    if (rental.status === 'confirmed') {
      setIsPaymentSheetVisible(true);
      return;
    }
    if (rental.status === 'completed') {
      setNotice('Select a star to rate this rental experience.');
      return;
    }
    if (rental.status === 'canceled') {
      onFindCars?.();
      return;
    }
    onManageRental?.();
  };

  return (
    <View style={styles.screen} {...backGestureHandlers}>
      <StatusBar backgroundColor={colors.white} style="dark" />

      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <BackButton accessibilityLabel="Back to rentals" onPress={handleBack} />
          <Text style={styles.headerTitle}>Rental details</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.vehicleCard}>
          <Image
            resizeMode="cover"
            source={rental.vehicle.image}
            style={styles.vehicleImage}
          />
          <View style={styles.vehicleCopy}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: presentation.background },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: presentation.color }]}
              />
              <Text style={[styles.statusText, { color: presentation.color }]}>
                {presentation.label}
              </Text>
            </View>
            <Text style={styles.vehicleBrand}>{rental.vehicle.brand}</Text>
            <Text numberOfLines={2} style={styles.vehicleName}>
              {rental.vehicle.model}
            </Text>
            <Text style={styles.reference}>Booking #{rental.bookingReference}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: presentation.background },
          ]}
        >
          <View style={styles.statusIconContainer}>
            <Image
              resizeMode="contain"
              source={presentation.icon}
              style={[styles.statusIcon, { tintColor: presentation.color }]}
            />
          </View>
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color: presentation.color }]}>
              {presentation.title}
            </Text>
            <Text style={styles.statusDescription}>
              {presentation.description}
            </Text>
          </View>
        </View>

        {rental.status === 'completed' && (
          <View style={styles.ratingCard}>
            <View>
              <Text style={styles.ratingTitle}>How was your rental?</Text>
              <Text style={styles.ratingSubtitle}>
                Your feedback helps other renters.
              </Text>
            </View>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  accessibilityLabel={`Rate ${star} stars`}
                  accessibilityRole="button"
                  onPress={() => {
                    setRating(star);
                    setNotice(`Thanks—you rated this rental ${star} stars.`);
                  }}
                >
                  <Ionicons
                    color={colors.warning}
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={25}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Booking information</Text>
        <View style={styles.detailsGrid}>
          <DetailCell
            helper={rental.pickupTime}
            icon={calendarIcon}
            label="Pickup date"
            value={rental.pickupDate}
          />
          <DetailCell
            helper={rental.endTime}
            icon={calendarIcon}
            label="Return date"
            value={rental.endDate}
          />
          <DetailCell
            icon={durationIcon}
            label="Duration"
            value={rental.durationLabel}
          />
          <DetailCell
            icon={deliveryIcon}
            label="Pickup type"
            value={rental.pickupType}
          />
          <DetailCell
            icon={driverIcon}
            label="Driving option"
            value={rental.driver}
          />
          <DetailCell
            icon={completedIcon}
            label="Insurance"
            value={rental.insured}
          />
        </View>

        <Text style={styles.sectionTitle}>Pickup information</Text>
        <View style={styles.locationCard}>
          <View style={styles.locationIconContainer}>
            <LocationIcon size={24} />
          </View>
          <View style={styles.locationCopy}>
            <Text style={styles.locationLabel}>Pickup location</Text>
            <Text style={styles.locationValue}>{rental.pickupLocation}</Text>
            <Text style={styles.locationHelper}>
              Exact instructions become available after confirmation and payment.
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Open pickup location"
            accessibilityRole="button"
            onPress={() =>
              setNotice(`Pickup is scheduled at ${rental.pickupLocation}.`)
            }
            style={({ pressed }) => [
              styles.locationAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={colors.primaryBrandBlue}
              name="navigate-outline"
              size={21}
            />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Payment summary</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.walletIconContainer}>
              <Image source={walletIcon} style={styles.walletIcon} />
            </View>
            <View>
              <Text style={styles.paymentHeaderTitle}>Booking payment</Text>
              <Text style={styles.paymentHeaderSubtitle}>
                Reference {rental.bookingReference}
              </Text>
            </View>
          </View>
          {paymentRows.map((row) => (
            <PaymentRow
              key={row.label}
              emphasized={row.emphasized}
              label={row.label}
              value={row.value}
              valueColor={
                row.value === 'Paid in full' || row.value === 'Returned'
                  ? colors.success
                  : undefined
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Car owner</Text>
        <View style={styles.ownerCard}>
          <Image source={ownerImage} style={styles.ownerImage} />
          <View style={styles.ownerCopy}>
            <Text style={styles.ownerName}>Munoh N.</Text>
            <View style={styles.ownerRating}>
              <Ionicons color={colors.warning} name="star" size={14} />
              <Text style={styles.ownerRatingText}>4.8 · Verified owner</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Message car owner"
            accessibilityRole="button"
            onPress={onMessageOwner}
            style={({ pressed }) => [styles.ownerAction, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.primaryBrandBlue}
              name="chatbubble-ellipses-outline"
              size={20}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Call car owner"
            accessibilityRole="button"
            onPress={() => setNotice('Preparing a call to the car owner.')}
            style={({ pressed }) => [styles.ownerAction, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.primaryBrandBlue}
              name="call-outline"
              size={20}
            />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onContactSupport}
          style={({ pressed }) => [styles.supportCard, pressed && styles.pressed]}
        >
          <View style={styles.supportIcon}>
            <Image
              resizeMode="contain"
              source={logoBlue}
              style={styles.supportLogo}
            />
          </View>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Need help with this rental?</Text>
            <Text style={styles.supportText}>Contact G-Rides support</Text>
          </View>
          <Ionicons
            color={colors.primaryBrandBlue}
            name="chevron-forward"
            size={19}
          />
        </Pressable>
      </ScrollView>

      {notice && (
        <View style={styles.notice}>
          <Ionicons color={colors.white} name="information-circle" size={20} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={onViewCar}
            style={({ pressed }) => [
              styles.viewCarButton,
              pressed && styles.pressed,
            ]}
          >
            <Image source={carIcon} style={styles.viewCarIcon} />
            <Text style={styles.viewCarText}>View car</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handlePrimaryAction}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text numberOfLines={1} style={styles.primaryButtonText}>
              {presentation.actionLabel}
            </Text>
            <Ionicons color={colors.white} name="arrow-forward" size={19} />
          </Pressable>
        </View>
      </SafeAreaView>

      <PaymentMethodSheet
        amount={formatMoney(amountDue)}
        bookingReference={rental.bookingReference}
        onClose={() => setIsPaymentSheetVisible(false)}
        onContinue={completePaymentMethodSelection}
        visible={isPaymentSheetVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  headerSafeArea: {
    backgroundColor: colors.white,
  },
  header: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 16,
    paddingBottom: 142,
  },
  vehicleCard: {
    minHeight: 130,
    flexDirection: 'row',
    gap: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 9,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 4,
  },
  vehicleImage: {
    width: 142,
    height: 112,
    borderRadius: 11,
    backgroundColor: colors.surfaceGray,
  },
  vehicleCopy: {
    minWidth: 0,
    flex: 1,
    paddingTop: 3,
    paddingRight: 5,
  },
  statusBadge: {
    height: 23,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
  },
  vehicleBrand: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 9,
  },
  vehicleName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 2,
  },
  reference: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 'auto',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  statusIconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.white,
  },
  statusIcon: {
    width: 24,
    height: 24,
  },
  statusCopy: {
    minWidth: 0,
    flex: 1,
  },
  statusTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  statusDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 14,
    marginTop: 16,
  },
  ratingTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  ratingSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    marginTop: 3,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
    marginTop: 27,
    marginBottom: 13,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },
  detailCell: {
    width: '50%',
    minHeight: 89,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EDF4FE',
  },
  detailIcon: {
    width: 21,
    height: 21,
    tintColor: colors.primaryBrandBlue,
  },
  detailCellCopy: {
    minWidth: 0,
    flex: 1,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  detailValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 15,
    marginTop: 3,
  },
  detailHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    marginTop: 3,
  },
  locationCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },
  locationIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#EDF4FE',
  },
  locationCopy: {
    minWidth: 0,
    flex: 1,
  },
  locationLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  locationValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  locationHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
  },
  locationAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#EDF4FE',
  },
  paymentCard: {
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 13,
  },
  walletIconContainer: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#EDF4FE',
  },
  walletIcon: {
    width: 22,
    height: 22,
    tintColor: colors.primaryBrandBlue,
  },
  paymentHeaderTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  paymentHeaderSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    marginTop: 2,
  },
  paymentRow: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },
  totalPaymentRow: {
    minHeight: 47,
  },
  paymentLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  totalPaymentLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  paymentValue: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
  },
  totalPaymentValue: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: '700',
  },
  ownerCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 12,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerCopy: {
    minWidth: 0,
    flex: 1,
  },
  ownerName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ownerRatingText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  ownerAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#EDF4FE',
  },
  supportCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 12,
    marginTop: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },
  supportIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#EDF4FE',
  },
  supportLogo: {
    width: 28,
    height: 28,
  },
  supportCopy: {
    minWidth: 0,
    flex: 1,
  },
  supportTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  supportText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },
  notice: {
    position: 'absolute',
    zIndex: 20,
    right: layout.screenGutter,
    bottom: 104,
    left: layout.screenGutter,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 13,
    paddingVertical: 9,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  noticeText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
  },
  footerSafeArea: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 12,
  },
  footer: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 12,
  },
  viewCarButton: {
    height: 52,
    flex: 0.82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: colors.primaryBrandBlue,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  viewCarIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primaryBrandBlue,
  },
  viewCarText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    height: 52,
    flex: 1.18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryBrandBlue,
    paddingHorizontal: 10,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});

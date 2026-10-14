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
import { colors, fonts, layout, moneyText } from '../theme';
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
        <Text style={styles.detailValue}>
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
          !value.includes('XAF') && { fontFamily: fonts.medium },
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
  const nextStep = rental.status === 'active'
    ? {
        title: 'Review your return details',
        description: `Return by ${rental.endDate}, ${rental.endTime}. Confirm arrangements with the owner.`,
      }
    : rental.status === 'confirmed'
      ? {
          title: 'Prepare for pickup',
          description: 'Review the payment summary and complete payment before collecting your car.',
        }
      : undefined;
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
      <StatusBar style="dark" />

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
        <View style={styles.hero}>
          <Image
            resizeMode="contain"
            source={rental.vehicle.image}
            style={styles.vehicleImage}
          />
        </View>
        <View style={styles.detailsSheet}>
          <View style={styles.vehicleCopy}>
            <View style={styles.identityRow}>
              <Text style={styles.vehicleName}>{rental.vehicle.brand} {rental.vehicle.model}</Text>
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
            </View>
            <Text style={styles.reference}>Booking #{rental.bookingReference}</Text>
          </View>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: nextStep ? colors.primaryBrandBlue : presentation.background },
          ]}
        >
          <View style={styles.statusIconContainer}>
            <Image
              resizeMode="contain"
              source={presentation.icon}
              style={[styles.statusIcon, { tintColor: nextStep ? colors.primaryBrandBlue : presentation.color }]}
            />
          </View>
          <View style={styles.statusCopy}>
            {nextStep && <Text style={styles.nextStepLabel}>Next step</Text>}
            <Text style={[styles.statusTitle, { color: nextStep ? colors.white : presentation.color }]}>
              {nextStep?.title ?? presentation.title}
            </Text>
            <Text style={[styles.statusDescription, nextStep && styles.nextStepDescription]}>
              {nextStep?.description ?? presentation.description}
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
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.detailLabel}>Pickup</Text>
            <Text style={styles.dateValue}>{rental.pickupDate}</Text>
            <Text style={styles.detailHelper}>{rental.pickupTime}</Text>
          </View>
          <View style={styles.dateDivider} />
          <View style={styles.dateColumn}>
            <Text style={styles.detailLabel}>Return</Text>
            <Text style={styles.dateValue}>{rental.endDate}</Text>
            <Text style={styles.detailHelper}>{rental.endTime}</Text>
          </View>
        </View>
        <View style={styles.detailsGrid}>
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
        </View>
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
            <Text style={styles.primaryButtonText}>
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
  hero: { paddingHorizontal: layout.screenGutter, paddingTop: 8, paddingBottom: 22 },
  detailsSheet: { flexGrow: 1, backgroundColor: colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: layout.screenGutter, paddingTop: 26, paddingBottom: 32 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateRow: { flexDirection: 'row', backgroundColor: colors.backgroundLight, borderRadius: 18, padding: 18, gap: 16 },
  dateColumn: { flex: 1, minWidth: 0 },
  dateDivider: { width: 1, backgroundColor: colors.borderGray },
  dateValue: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 15, lineHeight: 22, marginTop: 8 },
  nextStepLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.white, marginBottom: 7 },
  nextStepDescription: { color: colors.white, fontSize: 14, lineHeight: 22 },
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  headerSafeArea: { backgroundColor: colors.backgroundLight, },
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
  content: { flexGrow: 1, },
  vehicleImage: { width: '100%', height: 215, },
  vehicleCopy: { gap: 9, marginBottom: 6, },
  statusBadge: { minHeight: 28, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, gap: 6, },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  vehicleName: { flex: 1, color: colors.textPrimary, fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 29, },
  reference: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, },
  statusCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 18, padding: 16, marginTop: 18, },
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
    fontSize: 15,
    fontWeight: '600',
  },
  statusDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  ratingCard: { alignItems: 'flex-start', gap: 16, borderRadius: 18, backgroundColor: colors.backgroundLight, padding: 16, marginTop: 20, },
  ratingTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
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
  detailsGrid: { marginTop: 8, },
  detailCell: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderGray, },
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
  detailCellCopy: { minWidth: 0, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, },
  detailLabel: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, flexShrink: 1, },
  detailValue: { color: colors.textPrimary, fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, flexShrink: 1, textAlign: 'right', },
  detailHelper: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, marginTop: 5, },
  locationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8, },
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
    fontSize: 12,
  },
  locationValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  locationHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 15,
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
  paymentCard: { paddingVertical: 2, },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16, },
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
    fontSize: 14,
    fontWeight: '600',
  },
  paymentHeaderSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  paymentRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderGray, },
  totalPaymentRow: {
    minHeight: 47,
  },
  paymentLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  totalPaymentLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  paymentValue: {
    color: colors.textPrimary,
    fontSize: 12.5,
     ...moneyText },
  totalPaymentValue: {
    color: colors.primaryBrandBlue,
    fontSize: 15,
     ...moneyText },
  ownerCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, },
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
    fontSize: 15,
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
    fontSize: 12,
  },
  ownerAction: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#EDF4FE',
  },
  supportCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, backgroundColor: colors.backgroundLight, padding: 14, marginTop: 28, },
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
    fontSize: 13,
    fontWeight: '600',
  },
  supportText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 12,
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
    fontSize: 12.5,
    lineHeight: 17,
  },
  footerSafeArea: { backgroundColor: colors.white, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderGray, },
  footer: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 12,
  },
  viewCarButton: { minHeight: 52, flex: 0.82, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 28, backgroundColor: '#EDF4FE', paddingHorizontal: 12, paddingVertical: 12, },
  viewCarIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primaryBrandBlue,
  },
  viewCarText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: { minHeight: 52, flex: 1.18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 28, backgroundColor: colors.primaryBrandBlue, paddingHorizontal: 16, paddingVertical: 12, },
  primaryButtonText: { color: colors.white, fontFamily: fonts.semiBold, fontSize: 14, flexShrink: 1, textAlign: 'center', },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});

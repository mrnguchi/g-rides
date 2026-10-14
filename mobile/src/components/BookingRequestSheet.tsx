import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
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
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { RentalDatePicker } from './RentalDatePicker';
import { colors, fonts, layout, moneyText } from '../theme';
import type {
  BookingDrivingOption,
  BookingFulfillment,
  BookingRequest,
} from '../types/booking';
import type { Vehicle } from '../types/map';

type BookingStep = 'pending' | 'review' | 'sent' | 'setup';
type ConfirmationMode = 'cancelRequest' | 'discard';

type BookingRequestSheetProps = {
  existingRequest?: BookingRequest;
  onClose: () => void;
  onOpenActivity?: () => void;
  onMessageOwner?: () => void;
  onRequestCanceled?: (requestId: string) => void;
  onRequestSubmitted?: (request: BookingRequest) => void;
  vehicle: Vehicle;
  visible: boolean;
};

type DateOption = {
  date: Date;
  day: string;
  key: string;
  month: string;
  weekday: string;
};

const pickupTimeOptions = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'];

const calendarIcon = require('../../assets/images/calendar (1).png');
const deliveryIcon = require('../../assets/images/fast-delivery.png');
const driverIcon = require('../../assets/images/driver.png');
const ownerImage = require('../../assets/images/10007.png');
const pickupTimeIcon = require('../../assets/images/time-management.png');

function formatMoney(amount: number) {
  return `${amount.toLocaleString('en-US')} XAF`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric',
  });
}

function buildDateOptions(): DateOption[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);

    return {
      date,
      day: `${date.getDate()}`,
      key: formatDateKey(date),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });
}

type SummaryRowProps = {
  emphasized?: boolean;
  label: string;
  value: string;
};

function SummaryRow({ emphasized = false, label, value }: SummaryRowProps) {
  return (
    <View style={[styles.summaryRow, emphasized && styles.emphasizedSummaryRow]}>
      <Text
        style={[styles.summaryLabel, emphasized && styles.emphasizedSummaryLabel]}
      >
        {label.includes('XAF') ? <>{label.slice(0, label.indexOf('×') + 1)}<Text style={moneyText}>{label.slice(label.indexOf('×') + 1)}</Text></> : label}
      </Text>
      <Text
        style={[styles.summaryValue, emphasized && styles.emphasizedSummaryValue]}
      >
        {value}
      </Text>
    </View>
  );
}

export function BookingRequestSheet({
  existingRequest,
  onClose,
  onOpenActivity,
  onMessageOwner,
  onRequestCanceled,
  onRequestSubmitted,
  vehicle,
  visible,
}: BookingRequestSheetProps) {
  const { height } = useWindowDimensions();
  const DEPOSIT_XAF = vehicle.rentalTerms?.depositXaf ?? 0;
  const DELIVERY_FEE_XAF = vehicle.rentalTerms?.deliveryFeeXaf ?? 0;
  const CHAUFFEUR_FEE_PER_DAY_XAF = vehicle.rentalTerms?.chauffeurFeePerDayXaf ?? 0;
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [validationError, setValidationError] = useState('');
  const safeAreaInsets = useSafeAreaInsets();
  const dateOptions = useMemo(buildDateOptions, []);
  const wasVisibleRef = useRef(false);
  const [step, setStep] = useState<BookingStep>('setup');
  const [confirmationMode, setConfirmationMode] =
    useState<ConfirmationMode>();
  const [durationDays, setDurationDays] = useState(1);
  const [drivingOption, setDrivingOption] =
    useState<BookingDrivingOption>('selfDrive');
  const [fulfillment, setFulfillment] =
    useState<BookingFulfillment>('pickup');
  const [hasSubmittedThisSession, setHasSubmittedThisSession] = useState(false);
  const [localRequest, setLocalRequest] = useState<BookingRequest>();
  const [message, setMessage] = useState('');
  const [pickupTime, setPickupTime] = useState(pickupTimeOptions[0]);
  const [startDateKey, setStartDateKey] = useState(dateOptions[0].key);
  const sheetHeight = Math.min(790, height * 0.91);
  const bottomSafeArea = Math.max(
    safeAreaInsets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
  );

  const startDateOption = useMemo(() => ({ date: new Date(`${startDateKey}T12:00:00`) }), [startDateKey]);
  const endDate = useMemo(() => {
    const date = new Date(startDateOption.date);
    date.setDate(date.getDate() + durationDays);
    return date;
  }, [durationDays, startDateOption.date]);
  const rentalAmountXaf = vehicle.pricePerDayXaf * durationDays;
  const fulfillmentFeeXaf = fulfillment === 'delivery' ? DELIVERY_FEE_XAF : 0;
  const chauffeurFeeXaf =
    drivingOption === 'chauffeur'
      ? CHAUFFEUR_FEE_PER_DAY_XAF * durationDays
      : 0;
  const totalDueAfterApprovalXaf =
    rentalAmountXaf +
    fulfillmentFeeXaf +
    chauffeurFeeXaf +
    DEPOSIT_XAF;
  const isDraftDirty =
    durationDays !== 1 ||
    drivingOption !== 'selfDrive' ||
    fulfillment !== 'pickup' ||
    message.trim().length > 0 || deliveryAddress.trim().length > 0 ||
    pickupTime !== pickupTimeOptions[0] ||
    startDateKey !== dateOptions[0].key;
  const activeRequest = localRequest ?? existingRequest;

  const resetDraft = () => {
    setDurationDays(1);
    setDrivingOption('selfDrive');
    setFulfillment('pickup');
    setMessage('');
    setDeliveryAddress('');
    setValidationError('');
    setPickupTime(pickupTimeOptions[0]);
    setStartDateKey(dateOptions[0].key);
  };

  const closeSheet = () => {
    setConfirmationMode(undefined);
    setHasSubmittedThisSession(false);
    setStep('setup');
    onClose();
  };

  const requestDismiss = () => {
    if ((step === 'setup' || step === 'review') && isDraftDirty) {
      setConfirmationMode('discard');
      return;
    }

    closeSheet();
  };

  const goBackOneStep = () => {
    if (confirmationMode) {
      setConfirmationMode(undefined);
      return;
    }

    if (step === 'review') {
      setStep('setup');
      return;
    }

    if (step === 'pending' && hasSubmittedThisSession) {
      setStep('sent');
      return;
    }

    requestDismiss();
  };

  const backGestureHandlers = useScreenBackNavigation(goBackOneStep, visible);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setConfirmationMode(undefined);
      setHasSubmittedThisSession(false);
      setLocalRequest(existingRequest);
      setStep(existingRequest ? 'pending' : 'setup');
    }

    wasVisibleRef.current = visible;
  }, [existingRequest, visible]);

  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.2,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 70 || gesture.vy > 0.85) requestDismiss();
        },
      }),
    [isDraftDirty, step],
  );

  const submitRequest = () => {
    const request: BookingRequest = {
      bookingReference: `GR${Date.now().toString().slice(-6)}`,
      chauffeurFeeXaf,
      createdAt: new Date().toISOString(),
      depositXaf: DEPOSIT_XAF,
      drivingOption,
      durationDays,
      endDate: formatLongDate(endDate),
      fulfillment,
      fulfillmentFeeXaf,
      id: `booking-request-${vehicle.id}-${Date.now()}`,
      message: message.trim() || undefined,
      pickupTime,
      rentalAmountXaf,
      startDate: formatLongDate(startDateOption.date),
      status: 'pending',
      handoverAddress: fulfillment === 'delivery' ? deliveryAddress.trim() : vehicle.rentalTerms?.pickupLocation,
      totalDueAfterApprovalXaf,
      vehicle,
    };

    setLocalRequest(request);
    setHasSubmittedThisSession(true);
    setStep('sent');
    onRequestSubmitted?.(request);
  };

  const cancelRequest = () => {
    if (!activeRequest) return;
    onRequestCanceled?.(activeRequest.id);
    setLocalRequest(undefined);
    resetDraft();
    closeSheet();
  };

  const progressStep =
    step === 'setup' ? 1 : step === 'review' ? 2 : 3;
  const title =
    step === 'setup'
      ? 'Plan your rental'
      : step === 'review'
        ? 'Review your request'
        : step === 'sent'
          ? 'Request sent'
          : 'Request details';
  const subtitle =
    step === 'setup'
      ? 'Choose your dates and rental preferences.'
      : step === 'review'
        ? 'Confirm everything before sending it to the owner.'
        : step === 'sent'
          ? 'Follow your request in Activity.'
          : 'Waiting for the owner to respond.';

  const renderSetup = () => (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.vehicleCard}>
        <Image resizeMode="cover" source={vehicle.image} style={styles.vehicleImage} />
        <View style={styles.vehicleCopy}>
          <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
          <Text numberOfLines={1} style={styles.vehicleModel}>
            {vehicle.model}
          </Text>
          <Text style={styles.vehiclePrice}>
            {formatMoney(vehicle.pricePerDayXaf)}
            <Text style={styles.vehiclePriceUnit}> / day</Text>
          </Text>
        </View>
        <View style={styles.availableBadge}>
          <View style={styles.availableDot} />
          <Text style={styles.availableText}>Available</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Image source={calendarIcon} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Start date</Text>
      </View>
      <RentalDatePicker start={startDateKey} end={formatDateKey(endDate)} onChange={(start, days) => { setStartDateKey(start); setDurationDays(days); }} />

      <View style={styles.sectionHeader}>
        <Image source={pickupTimeIcon} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Pickup time</Text>
      </View>
      <View style={styles.chipRow}>
        {pickupTimeOptions.map((time) => {
          const selected = time === pickupTime;
          return (
            <Pressable
              key={time}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setPickupTime(time)}
              style={({ pressed }) => [
                styles.choiceChip,
                selected && styles.selectedChoiceChip,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.choiceChipText,
                  selected && styles.selectedChoiceChipText,
                ]}
              >
                {time}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.dateRangeText}>
        Return {formatLongDate(endDate)} at {pickupTime}
      </Text>

      <View style={styles.sectionHeader}>
        <Image source={driverIcon} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Driving option</Text>
      </View>
      <View style={styles.optionRow}>
        {[
          {
            description: 'You drive the vehicle',
            icon: 'car-outline' as const,
            id: 'selfDrive' as const,
            label: 'Self drive',
          },
          {
            description: `${formatMoney(CHAUFFEUR_FEE_PER_DAY_XAF)} / day`,
            icon: 'person-outline' as const,
            id: 'chauffeur' as const,
            label: 'With driver',
          },
        ].filter((option) => option.id !== 'chauffeur' || vehicle.rentalTerms?.chauffeurFeePerDayXaf !== undefined).map((option) => {
          const selected = drivingOption === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setDrivingOption(option.id)}
              style={({ pressed }) => [
                styles.optionCard,
                selected && styles.selectedOptionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.optionIcon, selected && styles.selectedOptionIcon]}>
                <Ionicons
                  color={selected ? colors.white : colors.primaryBrandBlue}
                  name={option.icon}
                  size={22}
                />
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={[styles.optionDescription, option.description.includes('XAF') && moneyText]}>{option.description}</Text>
              <View style={[styles.radio, selected && styles.selectedRadio]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Image source={deliveryIcon} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Get the car</Text>
      </View>
      <View style={styles.optionRow}>
        {[
          {
            description: 'Collect from the owner',
            icon: 'location-outline' as const,
            id: 'pickup' as const,
            label: 'Pick up',
          },
          {
            description: `From ${formatMoney(DELIVERY_FEE_XAF)}`,
            icon: 'car-sport-outline' as const,
            id: 'delivery' as const,
            label: 'Delivery',
          },
        ].filter((option) => option.id !== 'delivery' || vehicle.rentalTerms?.deliveryFeeXaf !== undefined).map((option) => {
          const selected = fulfillment === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setFulfillment(option.id)}
              style={({ pressed }) => [
                styles.optionCard,
                selected && styles.selectedOptionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.optionIcon, selected && styles.selectedOptionIcon]}>
                <Ionicons
                  color={selected ? colors.white : colors.primaryBrandBlue}
                  name={option.icon}
                  size={22}
                />
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={[styles.optionDescription, option.description.includes('XAF') && moneyText]}>{option.description}</Text>
              <View style={[styles.radio, selected && styles.selectedRadio]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {fulfillment === 'delivery' ? <>
        <Text style={styles.inputLabel}>Delivery address</Text>
        <TextInput value={deliveryAddress} onChangeText={(value) => { setDeliveryAddress(value); setValidationError(''); }} placeholder="Street, neighbourhood, and city" placeholderTextColor={colors.textSecondary} style={styles.messageInput} maxLength={250} />
      </> : <Text style={styles.dateRangeText}>Pickup: {vehicle.rentalTerms?.pickupLocation ?? 'Confirm pickup location with the owner'}</Text>}
      {!!validationError && <Text accessibilityRole="alert" style={[styles.dateRangeText, { color: colors.error }]}>{validationError}</Text>}
      <Text style={styles.inputLabel}>Message to the owner (optional)</Text>
      <TextInput
        maxLength={300}
        multiline
        onChangeText={setMessage}
        placeholder="Share any trip or pickup details..."
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primaryBrandBlue}
        style={styles.messageInput}
        textAlignVertical="top"
        value={message}
      />
      <Text style={styles.characterCount}>{message.length}/300</Text>
    </ScrollView>
  );

  const renderReview = () => (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.reviewVehicleCard}>
        <Image source={vehicle.image} style={styles.reviewVehicleImage} />
        <View style={styles.reviewVehicleCopy}>
          <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
          <Text numberOfLines={1} style={styles.reviewVehicleName}>
            {vehicle.model}
          </Text>
          <View style={styles.reviewRatingRow}>
            <Ionicons color={colors.warning} name="star" size={14} />
            <Text style={styles.reviewRating}>{vehicle.rating.toFixed(1)}</Text>
            <Text style={styles.reviewAvailable}>Available</Text>
          </View>
        </View>
      </View>

      <Text style={styles.reviewSectionTitle}>Your rental</Text>
      <View style={styles.reviewDetailCard}>
        <View style={styles.reviewDetailRow}>
          <View style={styles.reviewDetailIcon}>
            <Image source={calendarIcon} style={styles.reviewIconImage} />
          </View>
          <View style={styles.reviewDetailCopy}>
            <Text style={styles.reviewDetailLabel}>Dates</Text>
            <Text style={styles.reviewDetailValue}>
              {formatLongDate(startDateOption.date)} – {formatLongDate(endDate)}
            </Text>
            <Text style={styles.reviewDetailHelper}>
              {durationDays} {durationDays === 1 ? 'day' : 'days'} · {pickupTime}
            </Text>
          </View>
          <Pressable onPress={() => setStep('setup')}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewDetailRow}>
          <View style={styles.reviewDetailIcon}>
            <Image source={driverIcon} style={styles.reviewIconImage} />
          </View>
          <View style={styles.reviewDetailCopy}>
            <Text style={styles.reviewDetailLabel}>Driving option</Text>
            <Text style={styles.reviewDetailValue}>
              {drivingOption === 'selfDrive' ? 'Self drive' : 'Chauffeur-assisted'}
            </Text>
          </View>
          <Pressable onPress={() => setStep('setup')}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>
        <View style={styles.reviewDivider} />
        <View style={styles.reviewDetailRow}>
          <View style={styles.reviewDetailIcon}>
            <Image source={deliveryIcon} style={styles.reviewIconImage} />
          </View>
          <View style={styles.reviewDetailCopy}>
            <Text style={styles.reviewDetailLabel}>Vehicle handover</Text>
            <Text style={styles.reviewDetailValue}>
              {fulfillment === 'pickup' ? vehicle.rentalTerms?.pickupLocation ?? 'Confirm with owner' : deliveryAddress.trim()}
            </Text>
          </View>
          <Pressable onPress={() => setStep('setup')}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>
      </View>

      {message.trim() && (
        <>
          <Text style={styles.reviewSectionTitle}>Message to owner</Text>
          <View style={styles.messagePreview}>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="chatbubble-ellipses-outline"
              size={20}
            />
            <Text style={styles.messagePreviewText}>{message.trim()}</Text>
          </View>
        </>
      )}

      <Text style={styles.reviewSectionTitle}>Estimated total</Text>
      <View style={styles.priceCard}>
        <SummaryRow
          label={`${durationDays} ${durationDays === 1 ? 'day' : 'days'} × ${formatMoney(vehicle.pricePerDayXaf)}`}
          value={formatMoney(rentalAmountXaf)}
        />
        {chauffeurFeeXaf > 0 && (
          <SummaryRow label="Chauffeur service" value={formatMoney(chauffeurFeeXaf)} />
        )}
        {fulfillmentFeeXaf > 0 && (
          <SummaryRow label="Vehicle delivery" value={formatMoney(fulfillmentFeeXaf)} />
        )}
        <SummaryRow label="Refundable security deposit" value={formatMoney(DEPOSIT_XAF)} />
        <SummaryRow
          emphasized
          label="Due after owner approval"
          value={formatMoney(totalDueAfterApprovalXaf)}
        />
      </View>

      <View style={styles.infoCard}>
        <Ionicons color={colors.primaryBrandBlue} name="information-circle" size={21} />
        <Text style={styles.infoText}>
          You will not be charged now. Payment only becomes available after the
          owner accepts your request.
        </Text>
      </View>
    </ScrollView>
  );

  const renderSent = () => (
    <ScrollView
      contentContainerStyle={[styles.content, styles.statusContent]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.successIconOuter}>
        <View style={styles.successIconInner}>
          <Ionicons color={colors.white} name="checkmark" size={38} />
        </View>
      </View>
      <Text style={styles.statusTitle}>Booking request sent</Text>
<Text style={styles.statusDescription}>Your booking request is awaiting owner approval. Follow its progress in Activity. No payment is required yet.</Text>


      {activeRequest && (
        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>REQUEST REFERENCE</Text>
          <Text style={styles.referenceValue}>{activeRequest.bookingReference}</Text>
          <View style={styles.pendingPill}>
            <Ionicons color={colors.warning} name="time-outline" size={15} />
            <Text style={styles.pendingPillText}>Awaiting owner response</Text>
          </View>
        </View>
      )}

      <View style={styles.responseHint}>
        <Image source={driverIcon} style={styles.responseHintIcon} />
        <View style={styles.responseHintCopy}>
          <Text style={styles.responseHintTitle}>Continue in Activity</Text>
          <Text style={styles.responseHintText}>
            View your request, message the owner, or cancel before approval.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderPending = () => {
    if (!activeRequest) return renderSent();

    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pendingHeaderCard}>
          <View style={styles.pendingStatusIcon}>
            <Ionicons color={colors.warning} name="time-outline" size={28} />
          </View>
          <View style={styles.pendingHeaderCopy}>
            <Text style={styles.pendingHeaderTitle}>Awaiting confirmation</Text>
            <Text style={styles.pendingHeaderText}>
              The owner is reviewing your request. No payment is required yet.
            </Text>
          </View>
        </View>

        <View style={styles.pendingVehicleCard}>
          <Image source={vehicle.image} style={styles.pendingVehicleImage} />
          <View style={styles.pendingVehicleCopy}>
            <Text style={styles.vehicleBrand}>{vehicle.brand}</Text>
            <Text numberOfLines={1} style={styles.pendingVehicleName}>
              {vehicle.model}
            </Text>
            <Text style={styles.pendingReference}>
              Request #{activeRequest.bookingReference}
            </Text>
          </View>
        </View>

        <Text style={styles.reviewSectionTitle}>Request summary</Text>
        <View style={styles.requestSummaryCard}>
          <SummaryRow label="Start" value={activeRequest.startDate} />
          <SummaryRow label="Return" value={activeRequest.endDate} />
          <SummaryRow label="Pickup time" value={activeRequest.pickupTime} />
          <SummaryRow
            label="Driving option"
            value={
              activeRequest.drivingOption === 'selfDrive'
                ? 'Self drive'
                : 'Chauffeur-assisted'
            }
          />
          <SummaryRow
            label="Vehicle handover"
            value={activeRequest.handoverAddress ?? (activeRequest.fulfillment === 'pickup' ? 'Pick up' : 'Delivery')}
          />
          <SummaryRow
            emphasized
            label="Due if approved"
            value={formatMoney(activeRequest.totalDueAfterApprovalXaf)}
          />
        </View>

        <View style={styles.ownerWaitingCard}>
          <Image source={ownerImage} style={styles.ownerAvatar} />
          <View style={styles.ownerWaitingCopy}>
            <Text style={styles.ownerWaitingName}>Munoh N.</Text>
            <Text style={styles.ownerWaitingMeta}>Car owner</Text>
          </View>
          <Pressable
            accessibilityLabel="Message car owner"
            accessibilityRole="button"
            onPress={() => {
              closeSheet();
              onMessageOwner?.();
            }}
            style={({ pressed }) => [styles.messageOwnerIcon, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.primaryBrandBlue}
              name="chatbubble-ellipses-outline"
              size={21}
            />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setConfirmationMode('cancelRequest')}
          style={({ pressed }) => [styles.cancelRequestButton, pressed && styles.pressed]}
        >
          <Text style={styles.cancelRequestText}>Cancel booking request</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const renderFooter = () => {
    if (step === 'setup') {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={() => { if (fulfillment === 'delivery' && deliveryAddress.trim().length < 8) { setValidationError('Enter a complete delivery address.'); return; } setValidationError(''); setStep('review'); }}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
        >
          <Text style={styles.primaryButtonText}>Review request</Text>
          <Ionicons color={colors.white} name="arrow-forward" size={20} />
        </Pressable>
      );
    }

    if (step === 'review') {
      return (
        <Pressable
          accessibilityRole="button"
          onPress={submitRequest}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
        >
          <Ionicons color={colors.white} name="paper-plane-outline" size={19} />
          <Text style={styles.primaryButtonText}>Send booking request</Text>
        </Pressable>
      );
    }

    if (step === 'sent') {
      return (
        <View style={styles.sentActions}>
          <Pressable
            accessibilityRole="button"
            onPress={closeSheet}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => { closeSheet(); onOpenActivity?.(); }}
            style={({ pressed }) => [styles.primaryButton, styles.flexButton, pressed && styles.primaryPressed]}
          >
            <Text style={styles.primaryButtonText}>Go to Activity</Text>
            <Ionicons color={colors.white} name="arrow-forward" size={20} />
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          closeSheet();
          onMessageOwner?.();
        }}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
      >
        <Ionicons color={colors.white} name="chatbubble-ellipses-outline" size={20} />
        <Text style={styles.primaryButtonText}>Message owner</Text>
      </Pressable>
    );
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={goBackOneStep}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot} {...backGestureHandlers}>
        <StatusBar style="light" />
        <Pressable
          accessibilityLabel="Close booking request"
          accessibilityRole="button"
          onPress={requestDismiss}
          style={styles.backdrop}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <View style={[styles.sheet, { height: sheetHeight }]}>
              <View style={styles.dragArea} {...dragResponder.panHandlers}>
                <View style={styles.handle} />
              </View>

              <View style={styles.header}>
                {step === 'review' ||
                (step === 'pending' && hasSubmittedThisSession) ? (
                  <Pressable
                    accessibilityLabel="Previous booking step"
                    accessibilityRole="button"
                    onPress={goBackOneStep}
                    style={({ pressed }) => [
                      styles.headerButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      color={colors.textPrimary}
                      name="arrow-back"
                      size={22}
                    />
                  </Pressable>
                ) : (
                  <View style={styles.headerButtonSpacer} />
                )}

                <View style={styles.headerCopy}>
                  <Text style={styles.title}>{title}</Text>
                  <Text numberOfLines={1} style={styles.subtitle}>
                    {subtitle}
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel="Close booking request"
                  accessibilityRole="button"
                  onPress={requestDismiss}
                  style={({ pressed }) => [styles.headerCloseButton, pressed && styles.pressed]}
                >
                  <Ionicons color={colors.textSecondary} name="close" size={20} />
                </Pressable>
              </View>

              {step !== 'pending' && <View accessibilityLabel={`Step ${progressStep} of 3`} style={styles.progressRow}>
                {[1, 2, 3].map((progress) => (
                  <View
                    key={progress}
                    style={[
                      styles.progressSegment,
                      progress <= progressStep && styles.activeProgressSegment,
                    ]}
                  />
                ))}
              </View>}

              <View style={styles.body}>
                {step === 'setup'
                  ? renderSetup()
                  : step === 'review'
                    ? renderReview()
                    : step === 'sent'
                      ? renderSent()
                      : renderPending()}
              </View>

              <View
                style={[
                  styles.footer,
                  { paddingBottom: Math.max(12, bottomSafeArea + 8) },
                ]}
              >
                {renderFooter()}
              </View>

              {confirmationMode && (
                <View style={styles.confirmationLayer}>
                  <Pressable
                    accessibilityLabel="Keep booking request"
                    accessibilityRole="button"
                    onPress={() => setConfirmationMode(undefined)}
                    style={styles.confirmationBackdrop}
                  />
                  <View style={styles.confirmationCard}>
                    <View
                      style={[
                        styles.confirmationIcon,
                        confirmationMode === 'cancelRequest' && styles.dangerConfirmationIcon,
                      ]}
                    >
                      <Ionicons
                        color={
                          confirmationMode === 'cancelRequest'
                            ? colors.error
                            : colors.primaryBrandBlue
                        }
                        name={
                          confirmationMode === 'cancelRequest'
                            ? 'close-circle-outline'
                            : 'document-text-outline'
                        }
                        size={28}
                      />
                    </View>
                    <Text style={styles.confirmationTitle}>
                      {confirmationMode === 'cancelRequest'
                        ? 'Cancel this request?'
                        : 'Discard your changes?'}
                    </Text>
                    <Text style={styles.confirmationText}>
                      {confirmationMode === 'cancelRequest'
                        ? 'The owner will no longer be able to accept this booking request.'
                        : 'Your dates and rental preferences will not be saved.'}
                    </Text>
                    <View style={styles.confirmationActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setConfirmationMode(undefined)}
                        style={({ pressed }) => [styles.keepButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.keepButtonText}>
                          {confirmationMode === 'cancelRequest' ? 'Keep request' : 'Keep editing'}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          if (confirmationMode === 'cancelRequest') cancelRequest();
                          else {
                            resetDraft();
                            closeSheet();
                          }
                        }}
                        style={({ pressed }) => [styles.discardButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.discardButtonText}>
                          {confirmationMode === 'cancelRequest' ? 'Cancel request' : 'Discard'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
  },
  dragArea: {
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 43,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderGray,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: layout.screenGutter,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceGray,
  },
  headerButtonSpacer: {
    width: 40,
    height: 40,
  },
  headerCloseButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  headerCopy: {
    minWidth: 0,
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 19,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginTop: 3,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 12,
  },
  progressSegment: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.borderGray,
  },
  activeProgressSegment: {
    backgroundColor: colors.primaryBrandBlue,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 22,
  },
  vehicleCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    backgroundColor: '#EDF4FE',
    padding: 8,
  },
  vehicleImage: {
    width: 92,
    height: 70,
    borderRadius: 11,
    backgroundColor: colors.surfaceGray,
  },
  vehicleCopy: {
    minWidth: 0,
    flex: 1,
  },
  vehicleBrand: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  vehicleModel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 3,
  },
  vehiclePrice: {
    color: colors.primaryBrandBlue,
    fontSize: 14,
    marginTop: 7,
   ...moneyText },
  vehiclePriceUnit: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '400',
  },
  availableBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: '#EAF7EF',
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  availableText: {
    color: colors.success,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    tintColor: colors.primaryBrandBlue,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  dateList: {
    gap: 8,
    paddingRight: 10,
  },
  dateCard: {
    width: 61,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  selectedDateCard: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  dateWeekday: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
  },
  dateDay: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 2,
  },
  dateMonth: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  selectedDateText: {
    color: colors.white,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    minHeight: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 19,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
  },
  durationChip: {
    minWidth: 59,
    minHeight: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 19,
    backgroundColor: colors.white,
    paddingHorizontal: 11,
  },
  selectedChoiceChip: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  choiceChipText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    fontWeight: '500',
  },
  selectedChoiceChipText: {
    color: colors.white,
  },
  dateRangeText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginTop: 9,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    minHeight: 108,
    flex: 1,
    borderWidth: 1.2,
    borderColor: colors.borderGray,
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 12,
  },
  selectedOptionCard: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: '#EDF4FE',
  },
  optionIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#EDF4FE',
  },
  selectedOptionIcon: {
    backgroundColor: colors.primaryBrandBlue,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 9,
  },
  optionDescription: {
    maxWidth: '82%',
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.8,
    lineHeight: 14,
    marginTop: 3,
  },
  radio: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.4,
    borderColor: colors.borderGray,
    borderRadius: 10,
  },
  selectedRadio: {
    borderColor: colors.primaryBrandBlue,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primaryBrandBlue,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 23,
  },
  messageInput: {
    minHeight: 92,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 14,
    backgroundColor: '#F9FAFC',
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginTop: 10,
  },
  characterCount: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5,
  },
  reviewVehicleCard: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 15,
    backgroundColor: '#EDF4FE',
    padding: 9,
  },
  reviewVehicleImage: {
    width: 112,
    height: 82,
    borderRadius: 11,
    backgroundColor: colors.surfaceGray,
  },
  reviewVehicleCopy: {
    minWidth: 0,
    flex: 1,
  },
  reviewVehicleName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  reviewRating: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  reviewAvailable: {
    color: colors.success,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
    marginLeft: 7,
  },
  reviewSectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    fontWeight: '600',
    marginTop: 23,
    marginBottom: 10,
  },
  reviewDetailCard: {
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewDetailRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewDetailIcon: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#EDF4FE',
  },
  reviewIconImage: {
    width: 21,
    height: 21,
    tintColor: colors.primaryBrandBlue,
  },
  reviewDetailCopy: {
    minWidth: 0,
    flex: 1,
  },
  reviewDetailLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  reviewDetailValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 3,
  },
  reviewDetailHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 3,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#EEF1F5',
  },
  changeText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    backgroundColor: '#EDF4FE',
    padding: 13,
  },
  messagePreviewText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  priceCard: {
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },
  emphasizedSummaryRow: {
    minHeight: 55,
    borderBottomWidth: 0,
  },
  summaryLabel: {
    minWidth: 0,
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 13,
    textAlign: 'right',
   ...moneyText },
  emphasizedSummaryLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  emphasizedSummaryValue: {
    color: colors.primaryBrandBlue,
    fontSize: 15,
     ...moneyText },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 13,
    backgroundColor: '#EDF4FE',
    padding: 12,
    marginTop: 14,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  statusContent: {
    alignItems: 'center',
    paddingTop: 26,
  },
  successIconOuter: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
    backgroundColor: '#EAF7EF',
  },
  successIconInner: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 33,
    backgroundColor: colors.success,
  },
  statusTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 21,
  },
  statusDescription: {
    maxWidth: 330,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
  },
  referenceCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#EDF4FE',
    padding: 18,
    marginTop: 26,
  },
  referenceLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  referenceValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 6,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 14,
    backgroundColor: '#FFF5DF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 13,
  },
  pendingPillText: {
    color: '#A66400',
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
  },
  responseHint: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 14,
    backgroundColor: '#EDF4FE',
    padding: 13,
    marginTop: 15,
  },
  responseHintIcon: {
    width: 29,
    height: 29,
    tintColor: colors.primaryBrandBlue,
  },
  responseHintCopy: {
    minWidth: 0,
    flex: 1,
  },
  responseHintTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  responseHintText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 3,
  },
  pendingHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    backgroundColor: '#FFF8E8',
    padding: 14,
  },
  pendingStatusIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.white,
  },
  pendingHeaderCopy: {
    minWidth: 0,
    flex: 1,
  },
  pendingHeaderTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  pendingHeaderText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  pendingVehicleCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    backgroundColor: '#EDF4FE',
    padding: 8,
    marginTop: 14,
  },
  pendingVehicleImage: {
    width: 105,
    height: 76,
    borderRadius: 11,
  },
  pendingVehicleCopy: {
    minWidth: 0,
    flex: 1,
  },
  pendingVehicleName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 3,
  },
  pendingReference: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    marginTop: 8,
  },
  requestSummaryCard: {
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerWaitingCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    backgroundColor: '#EDF4FE',
    padding: 11,
    marginTop: 16,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF4FE',
  },
  ownerWaitingCopy: {
    minWidth: 0,
    flex: 1,
  },
  ownerWaitingName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  ownerWaitingMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  messageOwnerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#EDF4FE',
  },
  cancelRequestButton: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 13,
  },
  cancelRequestText: {
    color: colors.error,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 11,
    paddingBottom: 12,
  },
  primaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 26,
    backgroundColor: colors.primaryBrandBlue,
    shadowColor: colors.primaryBrandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },
  flexButton: {
    flex: 1.35,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  sentActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    height: 52,
    flex: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.3,
    borderColor: colors.primaryBrandBlue,
    borderRadius: 26,
    backgroundColor: colors.white,
  },
  secondaryButtonText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmationLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmationBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  confirmationCard: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 14,
  },
  confirmationIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: '#EDF4FE',
  },
  dangerConfirmationIcon: {
    backgroundColor: '#FDECEC',
  },
  confirmationTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
  confirmationText: {
    maxWidth: 285,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
  confirmationActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 9,
    marginTop: 20,
  },
  keepButton: {
    height: 47,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 24,
  },
  keepButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  discardButton: {
    height: 47,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.error,
  },
  discardButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});

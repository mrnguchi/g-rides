import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ComfortFeatureTag,
  DetailSpecChip,
  RentalInfoCard,
  RentalPolicyCard,
} from '../components/CarDetailElements';
import { BackButton, BookingRequestSheet, LocationIcon } from '../components';
import { CarRouteMap } from '../components/CarRouteMap';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { BookingRequest } from '../types/booking';
import type { Coordinate, Vehicle } from '../types/map';

const galleryImages: ImageSourcePropType[] = [
  require('../../assets/images/10043.jpeg'),
  require('../../assets/images/10042.jpeg'),
  require('../../assets/images/10041.jpeg'),
];
const ownerImage = require('../../assets/images/10007.png');

const specificationRows = [
  [
    { label: 'Automatic', icon: require('../../assets/images/transmission.png') },
    { label: '7 Seats', icon: require('../../assets/images/car-seat.png') },
    { label: 'Diesel', icon: require('../../assets/images/fuel-pump.png') },
  ],
  [
    { label: 'AC', icon: require('../../assets/images/ac.png') },
    { label: 'GPS', icon: require('../../assets/images/location (1).png') },
    { label: 'Camera', icon: require('../../assets/images/camera.png') },
    { label: 'AWD', icon: require('../../assets/images/4x4.png') },
  ],
] satisfies Array<Array<{ icon: ImageSourcePropType; label: string }>>;

const rentalInfo = [
  {
    label: 'Deposit',
    value: '25,000XAF',
    helper: 'Refundable',
    icon: require('../../assets/images/wallet.png'),
  },
  {
    label: 'Driver',
    value: 'Optional',
    helper: 'Extra charge',
    icon: require('../../assets/images/driver.png'),
  },
  {
    label: 'Rental period',
    value: '1 Day',
    helper: 'Minimum',
    icon: require('../../assets/images/calendar (1).png'),
  },
  {
    label: 'Delivery',
    value: 'Available',
    helper: 'From 2000 xaf',
    icon: require('../../assets/images/fast-delivery.png'),
  },
] satisfies Array<{
  helper: string;
  icon: ImageSourcePropType;
  label: string;
  value: string;
}>;

const comfortFeatures = [
  { label: 'Leather seats', icon: require('../../assets/images/car-seat.png') },
  { label: 'Sunroof', icon: require('../../assets/images/opens.png') },
  { label: 'Apple play', icon: require('../../assets/images/music-note.png') },
  { label: 'Android auto', icon: require('../../assets/images/vehicle.png') },
  { label: 'Push start', icon: require('../../assets/images/power.png') },
  { label: 'Tinted windows', icon: require('../../assets/images/tinting.png') },
  {
    label: 'Cruise control',
    icon: require('../../assets/images/speedometer.png'),
  },
  {
    label: 'Parking sensors',
    icon: require('../../assets/images/parking-sensor.png'),
  },
] satisfies Array<{ icon: ImageSourcePropType; label: string }>;

const rentalPolicies = [
  { label: 'Fuel policy', icon: require('../../assets/images/fuel-pump.png') },
  { label: 'Damage policy', icon: require('../../assets/images/fairness.png') },
  {
    label: 'Cancellation policy',
    icon: require('../../assets/images/forbidden.png'),
  },
  {
    label: 'Late return policy',
    icon: require('../../assets/images/time-left.png'),
  },
] satisfies Array<{ icon: ImageSourcePropType; label: string }>;

type CarDetailScreenProps = {
  bookingRequest?: BookingRequest;
  onBack?: () => void;
  onBookingRequestCanceled?: (requestId: string) => void;
  onBookingRequestSubmitted?: (request: BookingRequest) => void;
  onMessageOwner?: () => void;
  userLocation: Coordinate;
  vehicle: Vehicle;
};

export function CarDetailScreen({
  bookingRequest,
  onBack,
  onBookingRequestCanceled,
  onBookingRequestSubmitted,
  onMessageOwner,
  userLocation,
  vehicle,
}: CarDetailScreenProps) {
  const { width } = useWindowDimensions();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingSheetVisible, setIsBookingSheetVisible] = useState(false);
  const [isRouteMapActive, setIsRouteMapActive] = useState(false);
  const images = useMemo(
    () => [vehicle.image, ...galleryImages],
    [vehicle.image],
  );
  const heroHeight = Math.min(430, Math.max(365, width * 0.95));
  const formattedPrice = vehicle.pricePerDayXaf.toLocaleString('en-US');
  const displayModel =
    vehicle.id === 'toyota-land-cruiser-black'
      ? 'Land Cruiser 2010'
      : vehicle.model;
  const displayDistance =
    vehicle.id === 'toyota-land-cruiser-black' ? 12 : vehicle.distanceKm;
  const backGestureHandlers = useScreenBackNavigation(onBack);

  return (
    <View style={styles.screen} {...backGestureHandlers}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!isRouteMapActive}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={images[activeImageIndex]}
            style={styles.heroImage}
          />

          <SafeAreaView
            edges={['top']}
            pointerEvents="box-none"
            style={styles.heroControlsSafeArea}
          >
            <View style={styles.heroControls}>
              <BackButton onPress={onBack} />
              <Pressable
                accessibilityLabel={
                  isFavorite ? 'Remove from favorites' : 'Add to favorites'
                }
                accessibilityRole="button"
                onPress={() => setIsFavorite((favorite) => !favorite)}
                style={({ pressed }) => [
                  styles.favoriteButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={28}
                />
              </Pressable>
            </View>
          </SafeAreaView>

          <View style={styles.availabilityBadge}>
            <View
              style={[
                styles.availabilityDot,
                !vehicle.available && styles.unavailableDot,
              ]}
            />
            <Text style={styles.availabilityText}>
              {vehicle.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.thumbnailRow}>
            {images.map((image, index) => {
              const active = index === activeImageIndex;

              return (
                <Pressable
                  key={index}
                  accessibilityLabel={`View vehicle image ${index + 1}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setActiveImageIndex(index)}
                  style={({ pressed }) => [
                    styles.thumbnailButton,
                    active && styles.activeThumbnail,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    accessibilityIgnoresInvertColors
                    resizeMode="cover"
                    source={image}
                    style={styles.thumbnail}
                  />
                  {index === images.length - 1 && (
                    <View style={styles.morePhotosOverlay}>
                      <Text style={styles.morePhotosText}>+6</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.vehicleSummary}>
            <View style={styles.vehicleIdentity}>
              <Text style={styles.brand}>{vehicle.brand}</Text>
              <Text numberOfLines={2} style={styles.model}>
                {displayModel}
              </Text>
              <View style={styles.distanceRow}>
                <LocationIcon size={16} />
                <Text style={styles.distance}>{displayDistance} km away</Text>
              </View>
            </View>

            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formattedPrice}XAF</Text>
                <Text style={styles.priceUnit}>/day</Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons color={colors.warning} name="star" size={16} />
                <Text style={styles.ratingValue}>{vehicle.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>(53 reviews)</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Car Details</Text>
          <View style={styles.specificationList}>
            {specificationRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.specificationRow}>
                {row.map((specification) => (
                  <DetailSpecChip
                    key={specification.label}
                    icon={specification.icon}
                    label={specification.label}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={styles.rentalInfoGrid}>
            <View style={styles.rentalInfoRow}>
              {rentalInfo.slice(0, 2).map((item) => (
                <RentalInfoCard key={item.label} {...item} />
              ))}
            </View>
            <View style={styles.rentalInfoRow}>
              {rentalInfo.slice(2, 4).map((item) => (
                <RentalInfoCard key={item.label} {...item} />
              ))}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.subsectionTitle}>About this car</Text>
            <Text
              numberOfLines={isDescriptionExpanded ? undefined : 2}
              style={styles.description}
            >
              Well-maintained Land Cruiser perfect for city rides, long trips and
              business travel. Comfortable, powerful and reliable, with a clean
              interior and thoughtful features for every journey.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsDescriptionExpanded((expanded) => !expanded)}
              style={({ pressed }) => [
                styles.readMoreButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.readMoreText}>
                {isDescriptionExpanded ? 'Read less' : 'Read more'}
              </Text>
              <Ionicons
                color={colors.primaryBrandBlue}
                name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
              />
            </Pressable>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.subsectionTitle}>Comfort +</Text>
            <View style={styles.comfortList}>
              <View style={styles.comfortRow}>
                {comfortFeatures.slice(0, 4).map((feature) => (
                  <ComfortFeatureTag
                    key={feature.label}
                    {...feature}
                    style={styles.comfortTag}
                  />
                ))}
              </View>
              <View style={styles.comfortRow}>
                {comfortFeatures.slice(4, 8).map((feature) => (
                  <ComfortFeatureTag
                    key={feature.label}
                    {...feature}
                    style={styles.comfortTag}
                  />
                ))}
              </View>
            </View>
          </View>

          <Pressable
            accessibilityLabel="View owner profile for Munoh N."
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.ownerCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.ownerAvatarContainer}>
              <Image source={ownerImage} style={styles.ownerAvatar} />
              <View style={styles.verifiedBadge}>
                <Ionicons color={colors.white} name="checkmark" size={9} />
              </View>
            </View>

            <View style={styles.ownerIdentity}>
              <Text style={styles.ownerName}>Munoh N.</Text>
              <View style={styles.ownerRatingRow}>
                <Ionicons color={colors.warning} name="star" size={12} />
                <Text style={styles.ownerRating}>4.8</Text>
                <Text style={styles.ownerReviews}>(53 reviews)</Text>
              </View>
            </View>

            <View style={styles.ownerMetric}>
              <Text style={styles.ownerMetricValue}>124</Text>
              <Text style={styles.ownerMetricLabel}>Total rentals</Text>
            </View>
            <View style={styles.ownerMetric}>
              <Text style={styles.ownerMetricValue}>5 Mins</Text>
              <Text style={styles.ownerMetricLabel}>Response time</Text>
            </View>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="chevron-forward"
              size={17}
            />
          </Pressable>

          <View style={styles.sectionBlock}>
            <Text style={styles.subsectionTitle}>Rental policies</Text>
            <View style={styles.policyRow}>
              {rentalPolicies.slice(0, 2).map((policy) => (
                <RentalPolicyCard key={policy.label} {...policy} />
              ))}
            </View>
            <View style={styles.policyRow}>
              {rentalPolicies.slice(2, 4).map((policy) => (
                <RentalPolicyCard key={policy.label} {...policy} />
              ))}
            </View>
          </View>

          <CarRouteMap
            destination={vehicle.coordinate}
            onInteractionChange={setIsRouteMapActive}
            origin={userLocation}
            vehicle={vehicle}
          />
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.bookingFooterSafeArea}>
        <View style={styles.bookingFooter}>
          <View style={styles.footerPriceContainer}>
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerPrice}>{formattedPrice}XAF</Text>
              <Text style={styles.footerPriceUnit}>/day</Text>
            </View>
            <Text style={styles.footerHelper}>Payment after owner approval</Text>
          </View>

          <Pressable
            accessibilityLabel={
              bookingRequest
                ? `View pending request for ${vehicle.brand} ${displayModel}`
                : `Request to book ${vehicle.brand} ${displayModel}`
            }
            accessibilityRole="button"
            disabled={!vehicle.available}
            onPress={() => setIsBookingSheetVisible(true)}
            style={({ pressed }) => [
              styles.bookButton,
              !vehicle.available && styles.disabledBookButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.bookButtonText}>
              {vehicle.available
                ? bookingRequest
                  ? 'View request'
                  : 'Request to book'
                : 'Unavailable'}
            </Text>
            {vehicle.available && (
              <Ionicons color={colors.white} name="arrow-forward" size={20} />
            )}
          </Pressable>
        </View>
      </SafeAreaView>

      <BookingRequestSheet
        existingRequest={bookingRequest}
        onClose={() => setIsBookingSheetVisible(false)}
        onMessageOwner={onMessageOwner}
        onRequestCanceled={onBookingRequestCanceled}
        onRequestSubmitted={onBookingRequestSubmitted}
        vehicle={vehicle}
        visible={isBookingSheetVisible}
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
    paddingBottom: 140,
  },
  hero: {
    overflow: 'hidden',
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: colors.surfaceGray,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroControlsSafeArea: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  heroControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 9,
    paddingHorizontal: 18,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  availabilityBadge: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 7,
    backgroundColor: 'rgba(75, 85, 99, 0.88)',
    paddingHorizontal: 8,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  unavailableDot: {
    backgroundColor: colors.error,
  },
  availabilityText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: layout.screenGutter,
  },
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 20,
  },
  thumbnailButton: {
    width: 75,
    height: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 7,
    backgroundColor: colors.surfaceGray,
  },
  activeThumbnail: {
    borderColor: colors.primaryBrandBlue,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  morePhotosText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  vehicleSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 19,
  },
  vehicleIdentity: {
    minWidth: 0,
    flex: 1,
  },
  brand: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 15,
    fontWeight: '500',
  },
  model: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 21,
    fontWeight: '600',
    lineHeight: 25,
    marginTop: 3,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  distance: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  priceSummary: {
    alignItems: 'flex-end',
    paddingTop: 25,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 19,
    fontWeight: '600',
  },
  priceUnit: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginLeft: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
  },
  ratingValue: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  reviewCount: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 21,
    fontWeight: '600',
    marginTop: 28,
  },
  specificationList: {
    gap: 9,
    marginTop: 13,
  },
  specificationRow: {
    flexDirection: 'row',
    gap: 7,
  },
  rentalInfoGrid: {
    gap: 12,
    marginTop: 27,
  },
  rentalInfoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionBlock: {
    marginTop: 27,
  },
  subsectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  readMoreText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  comfortList: {
    gap: 7,
    marginTop: 10,
  },
  comfortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  comfortTag: {
    flex: 1,
  },
  ownerCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EDF1F6',
    borderRadius: 13,
    backgroundColor: colors.white,
    marginTop: 27,
    paddingHorizontal: 11,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ownerAvatarContainer: {
    width: 52,
    height: 52,
  },
  ownerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  verifiedBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 15,
    height: 15,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
  },
  ownerIdentity: {
    minWidth: 0,
    flex: 1.15,
  },
  ownerName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  ownerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  ownerRating: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  ownerReviews: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8,
  },
  ownerMetric: {
    minWidth: 54,
    alignItems: 'center',
  },
  ownerMetricValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  ownerMetricLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8,
    marginTop: 5,
    textAlign: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  bookingFooterSafeArea: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderGray,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 10,
  },
  bookingFooter: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    paddingBottom: 8,
  },
  footerPriceContainer: {
    minWidth: 0,
    flex: 1,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  footerPrice: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 19,
    fontWeight: '600',
  },
  footerPriceUnit: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginLeft: 2,
  },
  footerHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  bookButton: {
    minWidth: 166,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 30,
    backgroundColor: colors.primaryBrandBlue,
    paddingHorizontal: 22,
  },
  disabledBookButton: {
    backgroundColor: colors.textSecondary,
  },
  bookButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
});

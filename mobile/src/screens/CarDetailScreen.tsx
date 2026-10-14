import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { VehicleReviews } from '../components/VehicleReviews';
import { BookingRequestSheet } from '../components';
import { CarRouteMap } from '../components/CarRouteMap';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout, moneyText } from '../theme';
import type { BookingRequest } from '../types/booking';
import type { Coordinate, Vehicle } from '../types/map';
import type { ReviewInput, VehicleReview } from '../types/review';

type CarDetailScreenProps = {
  bookingRequest?: BookingRequest;
  onBack?: () => void;
  onBookingRequestCanceled?: (requestId: string) => void;
  onBookingRequestSubmitted?: (request: BookingRequest) => void;
  onMessageOwner?: () => void;
  onOpenActivity?: () => void;
  userLocation: Coordinate;
  vehicle: Vehicle;
  reviews: VehicleReview[];
  onSaveReview: (input: ReviewInput) => void;
};
type DetailTab = 'About' | 'Gallery' | 'Reviews';
const ownerImage = require('../../assets/images/10007.png');

export function CarDetailScreen({ bookingRequest, onBack, onBookingRequestCanceled, onBookingRequestSubmitted, onMessageOwner, onOpenActivity, userLocation, vehicle, reviews, onSaveReview }: CarDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('About');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookingSheetVisible, setIsBookingSheetVisible] = useState(false);
  const [isRouteMapActive, setIsRouteMapActive] = useState(false);
  const [tabPosition, setTabPosition] = useState(0);
  const photos = vehicle.ownerPhotos ?? [];
  const previewImages = [vehicle.image, ...photos.slice(0, 4)];
  const formattedPrice = vehicle.pricePerDayXaf.toLocaleString('en-US');
  const carName = `${vehicle.brand} ${vehicle.model}`;
  const displayRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : vehicle.rating;
  const backGestureHandlers = useScreenBackNavigation(onBack, true, !isRouteMapActive);

  useEffect(() => {
    setActiveTab('About');
    setIsFavorite(false);
    setIsRouteMapActive(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [vehicle.id]);

  const openGallery = () => {
    setActiveTab('Gallery');
    setIsRouteMapActive(false);
    scrollRef.current?.scrollTo({ y: tabPosition, animated: true });
  };

  return <View style={styles.screen} {...backGestureHandlers}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.headerButton}><View style={styles.backArrow}><AppIcon name="arrowForward" size={20} /></View></Pressable>
        <Text style={styles.headerTitle}>Car Details</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'} accessibilityState={{ selected: isFavorite }} onPress={() => setIsFavorite(!isFavorite)} style={styles.headerButton}><AppIcon name="favorite" solid={isFavorite} size={22} color={isFavorite ? colors.primaryBrandBlue : colors.textPrimary} /></Pressable>
      </View>
    </SafeAreaView>
    <ScrollView ref={scrollRef} scrollEnabled={!isRouteMapActive} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 115 + insets.bottom }}>
      <View style={styles.hero}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open owner photo gallery for ${carName}`} onPress={openGallery} style={styles.heroImageButton}>
          <Image source={vehicle.image} resizeMode="contain" style={styles.heroImage} />
        </Pressable>
        <View style={styles.heroUnderline} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
          {previewImages.map((source, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={index === 0 ? 'Open car gallery' : `Open gallery from owner photo ${index}`} onPress={openGallery} style={styles.thumbnailButton}><Image source={source} resizeMode={index === 0 ? 'contain' : 'cover'} style={styles.thumbnail} /></Pressable>)}
          {photos.length > 4 && <Pressable accessibilityRole="button" accessibilityLabel={`View all ${photos.length} owner photos`} onPress={openGallery} style={styles.morePhotos}><Text style={styles.morePhotosText}>+{photos.length - 4}</Text></Pressable>}
        </ScrollView>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryTop}><Text style={styles.category}>{vehicle.category === 'SUVs' ? 'SUV' : vehicle.category === 'Sedans' ? 'Sedan' : vehicle.category}</Text><View accessible accessibilityLabel={`Rated ${displayRating.toFixed(1)} out of 5`} style={styles.ratingRow}><Image source={require('../../assets/images/star (1).png')} style={styles.ratingStar} /><Text style={styles.rating}>{displayRating.toFixed(1)}</Text></View></View>
        <Text style={styles.carName}>{carName}</Text>
      </View>

      <View onLayout={(event) => setTabPosition(event.nativeEvent.layout.y)} style={styles.tabs}>
        {(['About', 'Gallery', 'Reviews'] as const).map((tab) => <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab }} onPress={() => { setActiveTab(tab); setIsRouteMapActive(false); }} style={[styles.tab, activeTab === tab && styles.selectedTab]}><Text style={[styles.tabText, activeTab === tab && styles.selectedTabText]}>{tab}</Text></Pressable>)}
      </View>

      {activeTab === 'About' ? <View style={styles.content}>
        <Text style={styles.sectionTitle}>Rent Partner</Text>
        <View style={styles.ownerRow}>
          <Image source={ownerImage} style={styles.ownerAvatar} />
          <View style={styles.ownerInfo}><Text style={styles.ownerName}>Munoh N.</Text><Text style={styles.secondaryText}>Owner</Text></View>
          {onMessageOwner && <Pressable accessibilityRole="button" accessibilityLabel="Message car owner" onPress={onMessageOwner} style={styles.contactButton}><AppIcon name="messages" size={22} color={colors.primaryBrandBlue} /></Pressable>}
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{vehicle.description ?? `Explore this ${carName} for your next rental. Message the owner to confirm its condition, included features, and pickup arrangements before requesting a booking.`}</Text>
        <View style={styles.specs}>
          {[
            ['Transmission', vehicle.transmission ?? 'Not specified'],
            ['Fuel type', vehicle.fuelType ?? 'Not specified'],
            ['Air conditioning', vehicle.airConditioning === undefined ? 'Not specified' : vehicle.airConditioning ? 'Yes' : 'No'],
            ['Seats', vehicle.seats?.toString() ?? 'Not specified'],
          ].map(([label, value]) => <View key={label} style={styles.spec}><Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{value}</Text></View>)}
        </View>
        <Text style={styles.sectionTitle}>Your rental</Text>
        <Text style={styles.description}>Choose your dates and review pickup or delivery, driver options, and the cost breakdown in your booking request. Payment follows owner approval.</Text>
        <Text style={styles.locationHeading}>Pickup area</Text>
        <Text style={styles.locationNote}>Location preview. Confirm the handover point with the owner.</Text>
        <CarRouteMap destination={vehicle.coordinate} onInteractionChange={setIsRouteMapActive} origin={userLocation} vehicle={vehicle} />
      </View> : activeTab === 'Gallery' ? <View style={styles.content}>
        <View style={styles.galleryHeader}><Text style={styles.sectionTitle}>Owner photos</Text><Text style={styles.secondaryText}>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</Text></View>
        {photos.length ? photos.map((source, index) => <Image key={`${vehicle.id}-${index}`} accessibilityLabel={`${carName}, owner photo ${index + 1}`} source={source} resizeMode="contain" style={styles.galleryImage} />) : <View style={styles.emptyGallery}><AppIcon name="vehicle" color={colors.textSecondary} size={34} /><Text style={styles.emptyTitle}>No owner photos yet</Text><Text style={styles.emptyDescription}>Photos of this car will appear here once the owner adds them.</Text></View>}
      </View> : <VehicleReviews key={vehicle.id} carName={carName} reviews={reviews} onSave={onSaveReview} />}
    </ScrollView>

    <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
      <View style={styles.footer}><View style={styles.footerPriceBlock}><Text style={styles.secondaryText}>Price</Text><Text style={styles.price}>{formattedPrice} XAF<Text style={styles.priceUnit}> /day</Text></Text></View>
        <Pressable accessibilityRole="button" disabled={!vehicle.available} onPress={() => setIsBookingSheetVisible(true)} style={({ pressed }) => [styles.bookButton, !vehicle.available && styles.disabled, pressed && styles.pressed]}><Text style={styles.bookText}>{!vehicle.available ? 'Unavailable' : bookingRequest ? 'View request' : 'Request to book'}</Text></Pressable>
      </View>
    </SafeAreaView>
    <BookingRequestSheet existingRequest={bookingRequest} onOpenActivity={onOpenActivity} onClose={() => setIsBookingSheetVisible(false)} onMessageOwner={onMessageOwner} onRequestCanceled={onBookingRequestCanceled} onRequestSubmitted={onBookingRequestSubmitted} vehicle={vehicle} visible={isBookingSheetVisible} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  headerSafeArea: { backgroundColor: '#F7F7F8' },
  header: { paddingHorizontal: layout.screenGutter, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: '#EBECF0', alignItems: 'center', justifyContent: 'center' },
  backArrow: { transform: [{ rotate: '180deg' }] },
  headerTitle: { color: colors.textPrimary, fontFamily: fonts.medium, fontSize: 16 },
  hero: { backgroundColor: '#F7F7F8', paddingBottom: 20 },
  heroImageButton: { height: 215, marginHorizontal: 16 },
  heroImage: { width: '100%', height: '100%' },
  heroUnderline: { height: 2, backgroundColor: '#BCDDF7', marginHorizontal: 52, marginBottom: 21, borderRadius: 20 },
  thumbnails: { paddingHorizontal: layout.screenGutter, gap: 7 },
  thumbnailButton: { width: 58, height: 49, borderRadius: 8, backgroundColor: colors.white, padding: 3, overflow: 'hidden' },
  thumbnail: { width: '100%', height: '100%', borderRadius: 5 },
  morePhotos: { width: 49, height: 49, backgroundColor: colors.primaryBrandBlue, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  morePhotosText: { fontFamily: fonts.semiBold, color: colors.white, fontSize: 14 },
  summary: { paddingHorizontal: layout.screenGutter, paddingTop: 21, paddingBottom: 18 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  category: { fontFamily: fonts.medium, fontSize: 12, color: colors.primaryBrandBlue, backgroundColor: '#EDF4FE', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4 },
  rating: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingStar: { width: 16, height: 16, resizeMode: 'contain', tintColor: colors.warning },
  carName: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 19, marginTop: 12 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ECEEF2', paddingHorizontal: layout.screenGutter },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  selectedTab: { borderBottomColor: colors.primaryBrandBlue },
  tabText: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 14 },
  selectedTabText: { color: colors.primaryBrandBlue },
  pendingTabText: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 14, opacity: 0.5 },
  content: { paddingHorizontal: layout.screenGutter, paddingTop: 22 },
  sectionTitle: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 15 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 28, gap: 11 },
  ownerAvatar: { width: 43, height: 43, borderRadius: 22 },
  ownerInfo: { flex: 1, gap: 4 },
  ownerName: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 14 },
  secondaryText: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13 },
  contactButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDF4FE', alignItems: 'center', justifyContent: 'center' },
  description: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, lineHeight: 22, marginTop: 10 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.backgroundLight, borderRadius: 13, padding: 15, marginVertical: 23, rowGap: 20 },
  spec: { width: '50%', paddingRight: 10, gap: 8 },
  specLabel: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 12 },
  specValue: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 13 },
  locationHeading: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 15, marginTop: 26 },
  locationNote: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, marginTop: 8, marginBottom: 12 },
  galleryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  galleryImage: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: colors.backgroundLight, marginBottom: 14 },
  emptyGallery: { alignItems: 'center', backgroundColor: colors.backgroundLight, borderRadius: 15, padding: 26, gap: 12 },
  emptyTitle: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 15 },
  emptyDescription: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13, lineHeight: 21, textAlign: 'center' },
  footerSafeArea: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenGutter, paddingVertical: 14, gap: 14 },
  footerPriceBlock: { flex: 1, gap: 4 },
  price: { color: colors.primaryBrandBlue, fontSize: 16,  ...moneyText },
  priceUnit: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12 },
  bookButton: { backgroundColor: colors.primaryBrandBlue, borderRadius: 26, paddingHorizontal: 23, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  bookText: { fontFamily: fonts.semiBold, color: colors.white, fontSize: 14 },
  disabled: { backgroundColor: colors.textSecondary },
  pressed: { opacity: 0.7 },
});

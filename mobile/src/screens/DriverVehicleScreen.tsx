import { useState, type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppIcon } from '../components/AppIcon';
import { colors, fonts, layout, shadows, surfaces } from '../theme';
import type { Vehicle } from '../types/map';

export type DriverAssignment = {
  vehicle: Vehicle;
  registration?: string;
  fuelType?: string;
  airConditioning?: boolean;
  ownerName: string;
  handoverLocation?: string;
};

export function DriverVehicleScreen({ assignment, navigation, onMessageOwner }: {
  assignment?: DriverAssignment;
  navigation: ReactNode;
  onMessageOwner: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const vehicle = assignment?.vehicle;
  const photos = vehicle?.ownerPhotos?.length ? vehicle.ownerPhotos : vehicle ? [vehicle.image] : [];
  const specs: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = vehicle && assignment ? [
    { label: 'Transmission', value: vehicle.transmission || 'Not provided', icon: 'swap-horizontal' },
    { label: 'Fuel type', value: assignment.fuelType || 'Not provided', icon: 'water-outline' },
    { label: 'Air conditioning', value: assignment.airConditioning === undefined ? 'Not provided' : assignment.airConditioning ? 'Yes' : 'No', icon: 'snow-outline' },
    { label: 'Seats', value: vehicle.seats?.toString() || 'Not provided', icon: 'people-outline' },
  ] : [];

  return <View style={styles.screen}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top']} style={styles.header}>
      <Text style={styles.headerTitle}>My Vehicle</Text>
      <Text style={styles.muted}>Your assigned car and essentials.</Text>
    </SafeAreaView>
    {!assignment || !vehicle ? <View style={styles.empty}>
      <View style={styles.iconContainer}><AppIcon name="vehicle" color={colors.primaryBrandBlue} size={34} /></View>
      <Text style={styles.heading}>No vehicle assigned yet</Text>
      <Text style={styles.emptyCopy}>Your car and its details will appear here when an owner assigns one to you.</Text>
    </View> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
      <Pressable accessibilityRole="button" accessibilityLabel="View vehicle photos" onPress={() => setGalleryOpen(true)} style={styles.hero}>
        <Image source={vehicle.image} resizeMode="contain" style={styles.heroImage} />
        <View style={styles.photoPill}><Ionicons name="images-outline" color={colors.primaryBrandBlue} size={17} /><Text style={styles.link}>View {photos.length === 1 ? 'photo' : `${photos.length} photos`}</Text></View>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.badge}>Assigned to you</Text>
        <Text style={styles.title}>{vehicle.brand} {vehicle.model}</Text>
        <Text style={styles.muted}>{assignment.registration ? `Registration · ${assignment.registration}` : 'Registration not provided'}</Text>

        <Text style={styles.heading}>Vehicle details</Text>
        <View style={styles.specGrid}>{specs.map(spec => <View key={spec.label} style={styles.spec}>
          <Ionicons name={spec.icon} size={23} color={colors.primaryBrandBlue} />
          <Text style={styles.specLabel}>{spec.label}</Text><Text style={styles.value}>{spec.value}</Text>
        </View>)}</View>

        <Text style={styles.heading}>Car owner</Text>
        <View style={styles.card}>
          <View style={styles.row}><View style={styles.iconContainer}><AppIcon name="profile" size={30} color={colors.primaryBrandBlue} /></View><View style={styles.flex}><Text style={styles.value}>{assignment.ownerName}</Text><Text style={styles.muted}>Your contact for this vehicle</Text></View></View>
          <Pressable accessibilityRole="button" onPress={onMessageOwner} style={styles.messageButton}><AppIcon name="messages" color={colors.primaryBrandBlue} size={21} /><Text style={styles.link}>Message owner</Text></Pressable>
        </View>

        <Text style={styles.heading}>Handover location</Text>
        <View style={[styles.card, styles.row]}><View style={styles.iconContainer}><AppIcon name="location" size={24} color={colors.primaryBrandBlue} /></View><View style={styles.flex}><Text style={styles.value}>{assignment.handoverLocation || 'Not arranged yet'}</Text><Text style={styles.muted}>Confirm collection and return with the owner.</Text></View></View>

        <Text style={styles.heading}>Vehicle documents</Text>
        <Text style={styles.sectionCopy}>Keep the car's documents within reach before your next trip.</Text>
        {['Carte grise', 'Insurance certificate', 'Visite technique'].map(name => <View key={name} style={styles.document}>
          <View style={styles.pdfContainer}><Image source={require('../../assets/images/pdf-icon.png')} resizeMode="contain" style={styles.pdf} /></View>
          <View style={styles.flex}><Text style={styles.value}>{name}</Text><Text style={styles.muted}>Not shared yet</Text></View>
        </View>)}
        <Pressable accessibilityRole="button" onPress={onMessageOwner} style={styles.requestButton}><Text style={styles.link}>Ask the owner for documents</Text><AppIcon name="arrowUpRight" color={colors.primaryBrandBlue} size={18} /></Pressable>
      </View>
    </ScrollView>}
    {navigation}
    <Modal visible={galleryOpen} animationType="slide" onRequestClose={() => setGalleryOpen(false)}>
      <SafeAreaView style={styles.gallery}><StatusBar style="dark" /><View style={styles.galleryHeader}><Text style={styles.headerTitle}>Vehicle photos</Text><Pressable accessibilityRole="button" accessibilityLabel="Close vehicle photos" onPress={() => setGalleryOpen(false)} style={styles.close}><AppIcon name="close" /></Pressable></View><ScrollView contentContainerStyle={styles.galleryContent}>{photos.map((photo, index) => <Image key={index} source={photo} resizeMode="contain" style={styles.galleryPhoto} />)}</ScrollView></SafeAreaView>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: surfaces.canvas },
  header: { paddingHorizontal: layout.screenGutter, paddingTop: 14, paddingBottom: 16, gap: 4 },
  headerTitle: { fontFamily: fonts.bold, color: colors.textPrimary, fontSize: 23 },
  muted: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  hero: { paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  heroImage: { width: '100%', height: 210 },
  photoPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 10, backgroundColor: colors.white, borderRadius: 24, ...shadows.soft },
  content: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: layout.screenGutter, paddingTop: 26, paddingBottom: 24 },
  badge: { alignSelf: 'flex-start', color: colors.primaryBrandBlue, backgroundColor: surfaces.blueSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, fontFamily: fonts.semiBold, fontSize: 12 },
  title: { color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 25, marginTop: 14, marginBottom: 6 },
  heading: { color: colors.textPrimary, fontFamily: fonts.bold, fontSize: 19, marginTop: 28, marginBottom: 15 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  spec: { flexGrow: 1, flexBasis: '44%', backgroundColor: surfaces.canvas, borderRadius: 20, padding: 16, gap: 6 },
  specLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 5 },
  value: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 23, color: colors.textPrimary },
  card: { borderRadius: 22, backgroundColor: colors.white, padding: 16, gap: 16, ...shadows.soft },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1, minWidth: 0 },
  iconContainer: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: surfaces.blueSoft },
  messageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 46, borderRadius: 24, backgroundColor: surfaces.blueSoft, padding: 12 },
  link: { fontFamily: fonts.semiBold, color: colors.primaryBrandBlue, fontSize: 14 },
  sectionCopy: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 18 },
  document: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, padding: 16, borderRadius: 20, marginBottom: 14, ...shadows.soft },
  pdfContainer: { width: 46, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: surfaces.canvas, borderRadius: 12 },
  pdf: { width: 29, height: 34 },
  requestButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  empty: { flex: 1, padding: 32, paddingBottom: 140, alignItems: 'center', justifyContent: 'center' },
  emptyCopy: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.textSecondary, textAlign: 'center' },
  gallery: { flex: 1, backgroundColor: surfaces.canvas },
  galleryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  galleryContent: { padding: 20, gap: 20 },
  galleryPhoto: { width: '100%', height: 290, backgroundColor: colors.white, borderRadius: 24 },
});

import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppIcon } from '../components/AppIcon';
import { CarRouteMap } from '../components/CarRouteMap';
import { MOCK_HOME_VEHICLES } from '../constants/mockVehicles';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, moneyText, statusText } from '../theme';
import type { FleetEdits, FleetItem } from '../types/fleet';

const money = (value: number) => `${value.toLocaleString('en-US')} XAF`;

export function OwnerVehicleDetailsScreen({ car, onBack, onSave }: {
  car: FleetItem; onBack: () => void; onSave: (edits: FleetEdits) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FleetEdits>(car);
  const [rate, setRate] = useState('');
  const [seats, setSeats] = useState('');
  const [error, setError] = useState('');
  const [mapActive, setMapActive] = useState(false);
  const back = () => editing ? setEditing(false) : onBack();
  const backHandlers = useScreenBackNavigation(back, true, !mapActive);
  const listing = MOCK_HOME_VEHICLES.find(item => item.id === car.id);
  const ownerPhotos = car.ownerPhotos ?? listing?.ownerPhotos;
  // This coordinate only centers the empty map; it is never shown as a phone report.
  const mapVehicle = listing ?? MOCK_HOME_VEHICLES[0];
  const openEdit = () => {
    setDraft(car); setRate(car.dailyRate?.toString() ?? ''); setSeats(car.seats?.toString() ?? '');
    setError(''); setEditing(true);
  };
  const save = () => {
    if (!/^\d+$/.test(rate) || !Number.isSafeInteger(Number(rate)) || Number(rate) <= 0) {
      setError('Enter a valid daily price in whole XAF.'); return;
    }
    if (seats && (!/^\d+$/.test(seats) || Number(seats) < 1 || Number(seats) > 20)) {
      setError('Enter a seat count between 1 and 20, or leave it empty.'); return;
    }
    onSave({ dailyRate: Number(rate), seats: seats ? Number(seats) : undefined,
      description: draft.description?.trim(), transmission: draft.transmission, fuelType: draft.fuelType,
      airConditioning: draft.airConditioning, status: draft.status });
    setEditing(false);
  };
  const choices = (label: string, values: string[], selected: string | undefined, onSelect: (value: string) => void) => <View style={styles.field}>
    <Text style={styles.label}>{label}</Text><View style={styles.choices}>{values.map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: selected === value }} onPress={() => onSelect(value)} style={[styles.choice, selected === value && styles.selected]}><Text style={[styles.body, selected === value && styles.selectedText, label === 'Availability' && statusText]}>{value}</Text></Pressable>)}</View>
  </View>;
  const row = (label: string, value: string) => <View key={label} style={styles.row}><Text style={styles.muted}>{label}</Text><Text style={[styles.value, value.includes('XAF') && moneyText, label === 'Availability' && statusText]}>{value}</Text></View>;
  return <SafeAreaView style={styles.screen} edges={['top', 'bottom']} {...backHandlers}>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={editing ? 'Cancel edits' : 'Back to fleet'} onPress={back} style={styles.iconButton}><View style={{ transform: [{ rotate: '180deg' }] }}><AppIcon name="arrowForward" size={22} /></View></Pressable>
      <Text style={styles.headerTitle}>{editing ? 'Edit vehicle' : 'Vehicle details'}</Text>
      <Pressable accessibilityRole="button" onPress={editing ? save : openEdit} style={styles.editButton}><Text style={styles.link}>{editing ? 'Save' : 'Edit'}</Text></Pressable>
    </View>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {editing ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
        <Text style={styles.title}>{car.name}</Text><Text style={styles.muted}>Update the information customers see on your listing.</Text>
        <View style={styles.field}><Text style={styles.label}>Daily price (XAF)</Text><TextInput accessibilityLabel="Daily price in XAF" keyboardType="number-pad" value={rate} onChangeText={setRate} style={[styles.input, moneyText]} /></View>
        <View style={styles.field}><Text style={styles.label}>About this car</Text><TextInput accessibilityLabel="About this car" multiline value={draft.description ?? ''} onChangeText={description => setDraft({ ...draft, description })} style={[styles.input, styles.descriptionInput]} maxLength={1500} /></View>
        {choices('Transmission', ['Automatic', 'Manual'], draft.transmission, transmission => setDraft({ ...draft, transmission }))}
        {choices('Fuel type', ['Petrol', 'Diesel', 'Hybrid', 'Electric'], draft.fuelType, fuelType => setDraft({ ...draft, fuelType }))}
        {choices('Air conditioning', ['Yes', 'No', 'Not specified'], draft.airConditioning === undefined ? 'Not specified' : draft.airConditioning ? 'Yes' : 'No', value => setDraft({ ...draft, airConditioning: value === 'Not specified' ? undefined : value === 'Yes' }))}
        <View style={styles.field}><Text style={styles.label}>Number of seats</Text><TextInput accessibilityLabel="Number of seats" keyboardType="number-pad" value={seats} onChangeText={setSeats} style={styles.input} maxLength={2} /></View>
        {car.status === 'Rented' || car.status === 'Pending verification' ? <Text style={styles.note}>Availability is managed by the {car.status === 'Rented' ? 'active rental' : 'verification process'}.</Text> : choices('Availability', ['Available', 'Maintenance'], draft.status, value => setDraft({ ...draft, status: value as 'Available' | 'Maintenance' }))}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable accessibilityRole="button" onPress={save} style={styles.save}><Text style={styles.saveText}>Save changes</Text></Pressable>
      </ScrollView> : <ScrollView scrollEnabled={!mapActive} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {car.image ? <Image source={car.image} resizeMode="contain" style={styles.hero} /> : <View style={[styles.hero, styles.placeholder]}><AppIcon name="vehicle" size={64} /><Text style={styles.muted}>Vehicle photo pending</Text></View>}
        <View style={styles.sheet}>
          <View style={styles.identity}><Text style={styles.badge}>{car.status}</Text>{car.rating !== undefined && <Text style={styles.link}>Rating {car.rating.toFixed(1)}</Text>}</View>
          <Text style={styles.title}>{car.name}</Text><Text style={styles.muted}>{[car.year, car.category, car.registration].filter(Boolean).join(' · ')}</Text>
          <Text style={styles.price}>{car.dailyRate === undefined ? 'Daily price not set' : `${money(car.dailyRate)} / day`}</Text>
          <Text style={styles.heading}>About this car</Text><Text style={styles.body}>{car.description || 'Add a description to help renters get to know your car.'}</Text>
          <Text style={styles.heading}>Specifications</Text>
          <View style={styles.surface}>{row('Transmission', car.transmission)}{row('Fuel type', car.fuelType ?? 'Not specified')}{row('Air conditioning', car.airConditioning === undefined ? 'Not specified' : car.airConditioning ? 'Yes' : 'No')}{row('Seats', car.seats?.toString() ?? 'Not specified')}</View>
          <Text style={styles.heading}>Owner photos</Text>
          {ownerPhotos?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>{ownerPhotos.map((photo, index) => <Image key={index} source={photo} style={styles.photo} />)}</ScrollView> : <Text style={styles.muted}>No owner photos added yet.</Text>}
          <Text style={styles.heading}>Rental settings</Text>
          <View style={styles.surface}>{row('Availability', car.status)}{row('Pickup', listing?.rentalTerms?.pickupLocation ?? 'Not specified')}{row('Security deposit', listing?.rentalTerms ? money(listing.rentalTerms.depositXaf) : 'Not specified')}</View>
          <Text style={styles.heading}>Vehicle documents</Text>
          {car.documents?.length ? <View style={styles.surface}>{car.documents.map(document => <View key={document.id} style={styles.row}><Text style={styles.body}>{document.name}</Text><Text style={[styles.link, statusText]}>{document.status}</Text></View>)}</View> : <Text style={styles.muted}>No documents added yet.</Text>}
          <Text style={styles.heading}>Vehicle summary</Text>
          <View style={styles.summary}><View style={styles.flex}><Text style={styles.muted}>Bookings</Text><Text style={styles.total}>{car.bookings}</Text></View><View style={styles.flex}><Text style={styles.muted}>Total earnings</Text><Text style={[styles.total, moneyText]}>{money(car.earnings)}</Text></View></View>
          <Text style={styles.note}>{car.status === 'Rented' ? 'This vehicle has an active rental.' : 'No rental is currently in progress.'}</Text>
          <Text style={styles.heading}>Last known location</Text>
          <Text style={styles.body}>Renter phone location</Text><Text style={styles.note}>Sharing: {car.status === 'Rented' ? 'No report received' : 'Inactive'} · Last updated: Not available</Text>
          <View style={styles.map}><CarRouteMap destination={mapVehicle.coordinate} origin={mapVehicle.coordinate} vehicle={mapVehicle} onInteractionChange={setMapActive} locationOnly={{ available: false, title: 'No location reported', detail: 'A shared phone location will appear here.', markerLabel: 'Last phone location' }} /></View>
          <Text style={styles.note}>A renter’s shared phone location may differ from the car’s location.</Text>
        </View>
      </ScrollView>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.backgroundLight }, flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }, headerTitle: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 19, color: colors.textPrimary }, iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, editButton: { padding: 12 },
  content: { paddingBottom: 16 }, hero: { width: '100%', height: 230 }, placeholder: { alignItems: 'center', justifyContent: 'center', gap: 15 }, sheet: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22 }, identity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, badge: { backgroundColor: '#EDF2FF', color: colors.primaryBrandBlue, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7, fontSize: 13, ...statusText },
  title: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 25, color: colors.textPrimary, marginBottom: 7 }, price: { fontSize: 20, color: colors.primaryBrandBlue, marginTop: 16,  ...moneyText }, heading: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 19, color: colors.textPrimary, marginTop: 30, marginBottom: 14 }, body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.textPrimary }, muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textSecondary }, note: { fontSize: 14, lineHeight: 22, color: colors.textSecondary, marginTop: 12 }, link: { fontSize: 15, fontWeight: '600', color: colors.primaryBrandBlue },
  surface: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4, backgroundColor: colors.backgroundLight }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, paddingVertical: 13 }, value: { flex: 1, textAlign: 'right', fontSize: 15, fontWeight: '500', color: colors.textPrimary }, photo: { width: 170, height: 125, borderRadius: 16, marginRight: 12 }, summary: { flexDirection: 'row', gap: 20, backgroundColor: '#EDF2FF', padding: 20, borderRadius: 20 }, total: { fontSize: 20, fontWeight: '700', color: colors.primaryBrandBlue, marginTop: 10 }, map: { marginTop: 18 },
  form: { padding: 22, paddingBottom: 40 }, field: { marginTop: 24 }, label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 }, input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderGray, borderRadius: 15, padding: 14, fontSize: 16, color: colors.textPrimary }, descriptionInput: { minHeight: 120, textAlignVertical: 'top' }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, choice: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 22, backgroundColor: colors.white }, selected: { backgroundColor: '#E6EDFF' }, selectedText: { color: colors.primaryBrandBlue, fontWeight: '600' }, error: { color: colors.error, marginTop: 18, fontSize: 14 }, save: { backgroundColor: colors.primaryBrandBlue, borderRadius: 28, alignItems: 'center', padding: 17, marginTop: 28 }, saveText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});

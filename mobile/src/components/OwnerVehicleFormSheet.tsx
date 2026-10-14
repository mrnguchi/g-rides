import { useEffect, useRef, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AppIcon } from './AppIcon';
import { VehicleDropdown } from './VehicleDropdown';
import { colors, statusText } from '../theme';
import type { VehicleFormValues } from './VehicleFormSheet';
import type { VehicleDocument, VehiclePhoto } from '../types/vehicle';

const catalogue: Record<string, string[]> = {
  Toyota: ['4Runner', 'Avensis', 'Camry', 'Corolla', 'Hilux', 'Land Cruiser', 'RAV4', 'Vitz', 'Yaris'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'GLK', 'ML'], BMW: ['1 Series', '3 Series', '5 Series', 'X1', 'X3', 'X5'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Fit'], Hyundai: ['Accent', 'Elantra', 'Santa Fe', 'Tucson'], Kia: ['Picanto', 'Rio', 'Sorento', 'Sportage'],
  Nissan: ['Almera', 'Juke', 'Patrol', 'Qashqai', 'X-Trail'], Mitsubishi: ['ASX', 'L200', 'Outlander', 'Pajero'], Lexus: ['ES', 'GX', 'LX', 'RX'], Ford: ['Escape', 'Explorer', 'Focus', 'Ranger'],
};
const docs = [
  { kind: 'registration', label: 'Carte grise', hint: 'Vehicle registration document' },
  { kind: 'insurance', label: 'Insurance certificate', hint: 'Proof of vehicle insurance' },
  { kind: 'roadworthiness', label: 'Visite technique', hint: 'Technical inspection certificate' },
  { kind: 'other', label: 'National ID or passport', hint: 'Choose either identity document' },
] as const;
const maxBytes = 10 * 1024 * 1024;

export function OwnerVehicleFormSheet({ visible, onClose, onSave }: { visible: boolean; onClose: () => void; onSave: (values: VehicleFormValues) => void }) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const session = useRef(0);
  const busy = useRef(false);
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState<string>();
  const [make, setMake] = useState(''); const [model, setModel] = useState('');
  const [otherMake, setOtherMake] = useState(''); const [otherModel, setOtherModel] = useState('');
  const [year, setYear] = useState(''); const [category, setCategory] = useState('');
  const [registration, setRegistration] = useState(''); const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('Petrol'); const [transmission, setTransmission] = useState('Automatic');
  const [files, setFiles] = useState<Record<string, VehicleDocument>>({});
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [preview, setPreview] = useState<VehiclePhoto>();
  const [error, setError] = useState(''); const [picking, setPicking] = useState(false);
  useEffect(() => {
    session.current += 1;
    if (visible) { setPhotos([]); setPreview(undefined); }
    if (visible) { setStep(1); setOpen(undefined); setMake(''); setModel(''); setOtherMake(''); setOtherModel(''); setYear(''); setCategory(''); setRegistration(''); setMileage(''); setFuel('Petrol'); setTransmission('Automatic'); setFiles({}); setError(''); }
    return () => { session.current += 1; };
  }, [visible]);
  const goStep = (value: number) => { setOpen(undefined); setError(''); setStep(value); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const back = () => { if (picking) return; if (preview) setPreview(undefined); else if (open) setOpen(undefined); else if (step === 2) goStep(1); else onClose(); };
  const pickPhotos = async () => {
    if (busy.current || photos.length >= 10) return;
    Keyboard.dismiss(); setOpen(undefined);
    busy.current = true; setPicking(true); setError('');
    const currentSession = session.current;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 10 - photos.length, quality: 0.85 });
      if (currentSession !== session.current || result.canceled) return;
      let skipped = 0;
      const additions: VehiclePhoto[] = [];
      for (const asset of result.assets) {
        if (!asset.uri || (asset.fileSize !== undefined && (asset.fileSize <= 0 || asset.fileSize > maxBytes))) { skipped++; continue; }
        if ([...photos, ...additions].some(photo => (asset.assetId && photo.assetId === asset.assetId) || photo.uri === asset.uri)) continue;
        additions.push({ id: `photo-${Date.now()}-${additions.length}`, uri: asset.uri, assetId: asset.assetId ?? undefined, fileName: asset.fileName ?? undefined, sizeBytes: asset.fileSize });
      }
      if (photos.length + additions.length > 10) skipped += photos.length + additions.length - 10;
      setPhotos(current => [...current, ...additions].slice(0, 10));
      if (skipped) setError('Some photos could not be added. Choose up to 10 photos, no larger than 10 MB each.');
    } catch { if (currentSession === session.current) setError('Could not open your photos. Please check photo access in Settings and try again.'); }
    finally { busy.current = false; setPicking(false); }
  };
  const pick = async (kind: string, label: string) => {
    if (busy.current) return;
    busy.current = true; setPicking(true); setError(''); const currentSession = session.current;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: false, copyToCacheDirectory: true });
      if (currentSession !== session.current || result.canceled) return;
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith('.pdf') || (file.mimeType && file.mimeType !== 'application/pdf')) { setError('Please choose a PDF document.'); return; }
      if (file.size === undefined || file.size <= 0 || file.size > maxBytes) { setError('Choose a non-empty PDF up to 10 MB with a readable file size.'); return; }
      setFiles(current => ({ ...current, [kind]: { id: `document-${kind}-${Date.now()}`, kind: kind as VehicleDocument['kind'], name: label, status: 'pending', fileName: file.name, uri: file.uri, sizeBytes: file.size, mimeType: 'application/pdf' } }));
    } catch { if (currentSession === session.current) setError('Could not open that document. Please try again.'); }
    finally { busy.current = false; setPicking(false); }
  };
  const submit = () => {
    if (picking) return;
    if (step === 1) {
      if (!make || !model || !year || !category || !registration.trim() || (make === 'Other' && !otherMake.trim()) || (model === 'Other' && !otherModel.trim())) { setError('Complete the vehicle details before continuing.'); return; }
      if (mileage && (!/^\d+$/.test(mileage) || !Number.isSafeInteger(Number(mileage)))) { setError('Mileage must be a whole, non-negative number.'); return; }
      if (!photos.length) { setError('Add at least one photo of your car before continuing.'); return; }
      goStep(2); return;
    }
    if (docs.some(doc => !files[doc.kind])) { setError('Attach all four documents to submit your vehicle.'); return; }
    onSave({ make: make === 'Other' ? otherMake.trim() : make, model: model === 'Other' ? otherModel.trim() : model, year: Number(year), category, registrationNumber: registration.trim().toUpperCase(), mileageKm: mileage ? Number(mileage) : undefined, fuelType: fuel.toLowerCase() as VehicleFormValues['fuelType'], transmission: transmission.toLowerCase() as VehicleFormValues['transmission'], relationship: 'fleet', documents: docs.map(doc => files[doc.kind]), ownerPhotos: photos });
  };
  const dropdown = (label: string, value: string, options: string[], select: (value: string) => void, disabled = false) => <VehicleDropdown label={label} value={value} options={options} disabled={disabled} open={open === label} onToggle={() => setOpen(current => current === label ? undefined : label)} onSelect={value => { select(value); setOpen(undefined); setError(''); }} />;
  const input = (label: string, value: string, change: (value: string) => void, numeric = false) => <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={change} keyboardType={numeric ? 'number-pad' : 'default'} autoCapitalize="characters" style={styles.input} placeholderTextColor={colors.textSecondary} placeholder={numeric ? '0' : label} /></View>;
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={back}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close add vehicle" onPress={() => { if (!picking) onClose(); }} style={styles.backdrop} />
      <View accessibilityViewIsModal={!preview} accessibilityElementsHidden={!!preview} importantForAccessibility={preview ? 'no-hide-descendants' : 'auto'} style={[styles.sheet, { maxHeight: '92%', paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.header}><View style={styles.headerIcon}><AppIcon name={step === 1 ? 'vehicle' : 'documents'} size={25} color={colors.primaryBrandBlue} /></View><View style={styles.flex}><Text style={styles.title}>{step === 1 ? 'Add a vehicle' : 'Vehicle documents'}</Text><Text style={styles.subtitle}>Step {step} of 2 · {step === 1 ? 'Vehicle details' : 'Supporting documents'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close add vehicle" disabled={picking} onPress={onClose} style={styles.close}><AppIcon name="close" size={21} /></Pressable></View>
        <View style={styles.progress}><View style={[styles.progressPart, styles.progressActive]} /><View style={[styles.progressPart, step === 2 && styles.progressActive]} /></View>
        <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {step === 1 ? <>
            <Text style={styles.copy}>Tell us about the car you want to add to your fleet.</Text>
            {dropdown('Make', make, [...Object.keys(catalogue), 'Other'], value => { setMake(value); setModel(''); setOtherModel(''); })}
            {make === 'Other' && input('Enter make', otherMake, setOtherMake)}
            {dropdown('Model', model, [...(catalogue[make] ?? []), 'Other'], setModel, !make)}
            {model === 'Other' && input('Enter model', otherModel, setOtherModel)}
            {dropdown('Year', year, Array.from({ length: new Date().getFullYear() - 1948 }, (_, i) => String(new Date().getFullYear() + 1 - i)), setYear)}
            {dropdown('Category', category, ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup', 'Van', 'Other'], setCategory)}
            {input('Registration number', registration, setRegistration)}
            {input('Mileage in km (optional)', mileage, setMileage, true)}
            {dropdown('Fuel type', fuel, ['Petrol', 'Diesel', 'Hybrid', 'Electric'], setFuel)}
            {dropdown('Transmission', transmission, ['Automatic', 'Manual'], setTransmission)}
            <View style={[styles.document, styles.photoSection]}>
              <View style={styles.documentTop}><View style={styles.headerIcon}><AppIcon name="vehicle" size={26} color={colors.primaryBrandBlue} /></View><View style={styles.flex}><Text style={styles.documentTitle}>Car photos</Text><Text style={styles.subtitle}>Show the exterior, interior and key details.</Text></View><Text style={styles.photoCount}>{photos.length}/10</Text></View>
              <Text style={styles.photoHint}>Add 1–10 photos, up to 10 MB each. Tap a thumbnail to preview.</Text>
              {!!photos.length && <View style={styles.gallery}>{photos.map((photo, index) => <View key={photo.id} style={styles.thumbnailCard}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Preview car photo ${index + 1}`} onPress={() => { Keyboard.dismiss(); setPreview(photo); }} style={styles.thumbnailButton}><Image source={{ uri: photo.uri }} resizeMode="cover" style={styles.thumbnail} /></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove car photo ${index + 1}`} disabled={picking} onPress={() => { setPhotos(current => current.filter(item => item.id !== photo.id)); setError(''); }} style={styles.removePhoto}><AppIcon name="close" size={16} color={colors.white} /></Pressable>
              </View>)}</View>}
              <Pressable accessibilityRole="button" accessibilityLabel="Add car photos" disabled={picking || photos.length >= 10} onPress={pickPhotos} style={[styles.choose, styles.addPhotos, (picking || photos.length >= 10) && { opacity: 0.5 }]}><AppIcon name="plus" size={18} color={colors.primaryBrandBlue} /><Text style={[styles.link, photos.length >= 10 && statusText]}>{photos.length >= 10 ? '10 photos selected' : 'Add photos'}</Text></Pressable>
            </View>
          </> : <>
            <Text style={styles.copy}>Attach one PDF per document, up to 10 MB each. Choose either a national ID or a passport for identity.</Text>
            {docs.map(doc => { const file = files[doc.kind]; return <View key={doc.kind} style={styles.document}>
              <View style={styles.documentTop}><Image source={require('../../assets/images/pdf-icon.png')} resizeMode="contain" style={styles.pdf} /><View style={styles.flex}><Text style={styles.documentTitle}>{doc.label}</Text><Text style={styles.subtitle}>{doc.hint}</Text></View></View>
              {file && <View style={styles.fileInfo}><Text numberOfLines={2} style={styles.fileName}>{file.fileName}</Text><Text style={styles.subtitle}>{((file.sizeBytes ?? 0) / 1024 / 1024).toFixed(2)} MB · Selected</Text></View>}
              <View style={styles.documentActions}><Pressable accessibilityRole="button" accessibilityLabel={`${file ? 'Replace' : 'Choose'} ${doc.label} PDF`} disabled={picking} onPress={() => pick(doc.kind, doc.label)} style={[styles.choose, picking && { opacity: 0.5 }]}><AppIcon name={file ? 'swap' : 'plus'} size={18} color={colors.primaryBrandBlue} /><Text style={styles.link}>{file ? 'Replace PDF' : 'Choose PDF'}</Text></Pressable>{file && <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${doc.label}`} disabled={picking} onPress={() => setFiles(current => { const next = { ...current }; delete next[doc.kind]; return next; })} style={styles.remove}><Text style={styles.removeText}>Remove</Text></Pressable>}</View>
            </View>; })}
            <Text style={styles.copy}>Your vehicle will appear as pending verification after submission.</Text>
          </>}
        </ScrollView>
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <View style={styles.footer}><Pressable accessibilityRole="button" disabled={picking} onPress={step === 1 ? onClose : () => goStep(1)} style={styles.secondary}><Text style={styles.secondaryText}>{step === 1 ? 'Cancel' : 'Back'}</Text></Pressable><Pressable accessibilityRole="button" disabled={picking} onPress={submit} style={[styles.primary, picking && { opacity: 0.5 }]}><Text style={styles.primaryText}>{step === 1 ? 'Next step' : 'Submit vehicle'}</Text><AppIcon name="arrowForward" size={19} color={colors.white} /></Pressable></View>
      </View>
      {preview && <View accessibilityViewIsModal style={[styles.preview, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.previewHeader}><Text style={styles.previewTitle}>Photo {photos.findIndex(photo => photo.id === preview.id) + 1} of {photos.length}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close photo preview" onPress={() => setPreview(undefined)} style={styles.previewClose}><AppIcon name="close" size={23} color={colors.white} /></Pressable></View>
        <Image accessibilityLabel="Selected car photo" source={{ uri: preview.uri }} resizeMode="contain" style={styles.previewImage} />
        <Pressable accessibilityRole="button" onPress={() => { setPhotos(current => current.filter(photo => photo.id !== preview.id)); setPreview(undefined); setError(''); }} style={styles.previewRemove}><Text style={styles.previewTitle}>Remove photo</Text></Pressable>
      </View>}
    </KeyboardAvoidingView>
  </Modal>;
}

const styles = StyleSheet.create({
  photoSection: { marginTop: 24 }, photoCount: { color: colors.primaryBrandBlue, fontSize: 13, ...statusText }, photoHint: { color: colors.textSecondary, fontSize: 13, lineHeight: 21, marginTop: 14 }, gallery: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 16 }, thumbnailCard: { width: '48%', aspectRatio: 1.25, borderRadius: 14, backgroundColor: colors.surfaceGray }, thumbnailButton: { flex: 1, borderRadius: 14, overflow: 'hidden' }, thumbnail: { width: '100%', height: '100%' }, removePhoto: { position: 'absolute', top: 2, right: 2, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(15,23,42,0.75)', alignItems: 'center', justifyContent: 'center' }, addPhotos: { alignSelf: 'flex-start', marginTop: 16 }, preview: { ...StyleSheet.absoluteFill, backgroundColor: colors.primaryDark, paddingHorizontal: 20 }, previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, previewTitle: { fontSize: 15, fontWeight: '600', color: colors.white }, previewClose: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }, previewImage: { flex: 1, width: '100%', marginVertical: 20 }, previewRemove: { alignSelf: 'center', paddingHorizontal: 24, minHeight: 48, justifyContent: 'center', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.12)' },
  root: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.45)' }, sheet: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 12 }, handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderGray, marginBottom: 18 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22 }, headerIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, title: { fontSize: 21, fontWeight: '700', color: colors.textPrimary }, subtitle: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 4, ...statusText }, close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' }, progress: { flexDirection: 'row', gap: 8, marginHorizontal: 22, marginVertical: 20 }, progressPart: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceGray }, progressActive: { backgroundColor: colors.primaryBrandBlue }, content: { paddingHorizontal: 22, paddingBottom: 22 }, copy: { fontSize: 14, lineHeight: 22, color: colors.textSecondary }, field: { marginTop: 18 }, label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 9 }, input: { minHeight: 52, borderWidth: 1, borderColor: colors.borderGray, borderRadius: 16, backgroundColor: colors.backgroundLight, paddingHorizontal: 15, fontSize: 15, color: colors.textPrimary },
  document: { backgroundColor: colors.backgroundLight, borderRadius: 20, padding: 16, marginVertical: 10 }, documentTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, pdf: { width: 38, height: 44 }, documentTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary }, fileInfo: { paddingTop: 12 }, fileName: { fontSize: 14, color: colors.textPrimary }, documentActions: { flexDirection: 'row', gap: 10, marginTop: 12 }, choose: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#E7EEFF', borderRadius: 22, paddingHorizontal: 14 }, link: { color: colors.primaryBrandBlue, fontSize: 13, fontWeight: '600' }, remove: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }, removeText: { color: colors.textSecondary, fontSize: 13 }, error: { color: colors.error, fontSize: 13, lineHeight: 20, paddingHorizontal: 22, paddingBottom: 10 }, footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 22, paddingTop: 12 }, secondary: { paddingHorizontal: 22, minHeight: 50, borderRadius: 25, backgroundColor: colors.surfaceGray, justifyContent: 'center', alignItems: 'center' }, primary: { flex: 1, minHeight: 50, borderRadius: 25, backgroundColor: colors.primaryBrandBlue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, primaryText: { color: colors.white, fontSize: 15, fontWeight: '600' }, secondaryText: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
});

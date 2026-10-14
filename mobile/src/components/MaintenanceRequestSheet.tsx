import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RentalDatePicker } from './RentalDatePicker';
import { useMaintenanceFlow, type MaintenanceBooking } from './MaintenanceFlowProvider';
import { AppIcon } from './AppIcon';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { MaintenanceProvider, MaintenanceServiceType } from '../types/maintenance';

const labels: Record<MaintenanceServiceType, string> = {
  oil_and_filter_change: 'Oil & filter change', diagnostics: 'Diagnostics', inspection: 'Inspection', battery_service: 'Battery service', tyre_service: 'Tyre service',
};

export function MaintenanceRequestSheet({ garage, visible, onClose }: { garage: MaintenanceProvider; visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [service, setService] = useState<MaintenanceServiceType>();
  const { activeRentals, submit, openActivity } = useMaintenanceFlow();
  const [rentalId, setRentalId] = useState(activeRentals[0]?.id);
  const rental = activeRentals.find(item => item.id === rentalId) ?? activeRentals[0];
  const vehicle = rental ? rental.vehicle.brand + ' ' + rental.vehicle.model : '';
  const now = new Date();
  const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const [preferredDate, setPreferredDate] = useState(today);
  const [submitted, setSubmitted] = useState<MaintenanceBooking>();
  const submitting = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const [issue, setIssue] = useState('');
  const [review, setReview] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const valid = !!service && !!rental && !!issue.trim() && preferredDate >= today;
  const back = () => submitted ? onClose() : review ? setReview(false) : onClose();
  const backHandlers = useScreenBackNavigation(back, visible);
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={back}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.root} {...backHandlers}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close service request" onPress={onClose} style={s.backdrop} />
      <View accessibilityViewIsModal style={[s.sheet, { marginTop: insets.top + 24 }]}>
        <View style={s.handle} />
        <View style={s.header}><View style={s.headerCopy}><Text style={s.title}>{submitted ? 'Request submitted' : review ? 'Review your request' : 'Request service'}</Text><Text style={s.secondary}>{garage.name}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close service request" onPress={onClose} style={s.close}><AppIcon name="close" size={20} /></Pressable></View>
        <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {submitted ? <>
            <View style={s.note}><AppIcon name="bookings" size={32} color={colors.primaryBrandBlue} /><Text style={s.label}>Awaiting garage response</Text><Text style={s.body}>Your request for {vehicle} is now in Activity. Follow its progress there and review the quote before approving any work.</Text></View>
            <Text style={s.body}>Reference: {submitted.reference}</Text>
            <Text style={s.body}>Your preferred visit date is subject to the garage’s confirmation. No payment is due at this step.</Text>
          </> : review ? <>
            <View style={s.summary}>{[['Service', service ? labels[service] : ''], ['Vehicle', vehicle.trim()], ['Preferred visit', new Date(preferredDate + 'T12:00:00').toLocaleDateString('en-GB')], ['What needs attention', issue.trim()]].map(([label, value]) => <View key={label} style={s.field}><Text style={s.label}>{label}</Text><Text style={s.body}>{value}</Text></View>)}</View>
            <Text style={s.body}>Your request is ready. You’ll review the garage’s quote before approving any work or replacement parts.</Text>
          </> : <>
            <View style={s.field}><Text style={s.label}>Choose a service</Text><View style={s.options}>{garage.maintenanceServices.map(key => <Pressable key={key} accessibilityRole="radio" accessibilityState={{ checked: service === key }} onPress={() => setService(key)} style={[s.option, service === key && s.selected]}><Text style={[s.optionText, service === key && s.selectedText]}>{labels[key]}</Text></Pressable>)}</View></View>
            <View style={s.field}><Text style={s.label}>Your current rental</Text>
              {rental ? <View style={s.rental}><Image source={rental.vehicle.image} resizeMode="contain" style={s.carImage} /><View style={s.rentalCopy}><Text style={s.label}>{vehicle}</Text><Text style={s.secondary}>Rental · {rental.bookingReference}</Text><Text style={s.selectedText}>Selected automatically</Text></View></View> : <Text style={s.body}>You don’t have an active rental. Start a rental to request maintenance for it.</Text>}
              {activeRentals.length > 1 && <View style={s.options}>{activeRentals.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: rental?.id === item.id }} onPress={() => setRentalId(item.id)} style={[s.option, rental?.id === item.id && s.selected]}><Text style={s.optionText}>{item.vehicle.brand} {item.vehicle.model} · {item.bookingReference}</Text></Pressable>)}</View>}
            </View>
            <RentalDatePicker singleDate start={preferredDate} end={preferredDate} onChange={date => setPreferredDate(date)} />
            <Text style={s.secondary}>The garage will confirm availability for your preferred date.</Text>
            <View style={s.field}><Text style={s.label}>What needs attention?</Text><TextInput accessibilityLabel="Describe the issue or service needed" placeholder="Tell the garage what you’ve noticed or the service you need." placeholderTextColor={colors.textSecondary} value={issue} onChangeText={setIssue} maxLength={1500} multiline textAlignVertical="top" style={[s.input, s.textArea]} /></View>
            <View style={s.note}><Text style={s.body}>Not sure what’s wrong? Describe the symptoms so the garage can help assess your vehicle.</Text></View>
            {attempted && !valid && <Text accessibilityRole="alert" style={s.error}>Choose a service, an active rental and a visit date today or later, and describe the issue.</Text>}
          </>}
        </ScrollView>
        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {review && !submitted && <Pressable accessibilityRole="button" onPress={() => setReview(false)} style={s.edit}><Text style={s.selectedText}>Edit</Text></Pressable>}
          <Pressable accessibilityRole="button" onPress={() => {
            if (submitted) { onClose(); openActivity(); return; }
            setAttempted(true);
            if (!valid) { setReview(false); return; }
            if (review && rental && service) {
              if (submitting.current) return;
              submitting.current = true;
              setSubmitted(submit({ garage, rental, service, issue: issue.trim(), preferredDate }));
            } else setReview(true);
            scroll.current?.scrollTo({ y: 0, animated: false });
          }} style={s.button}><Text style={s.buttonText}>{submitted ? 'Go to Activity' : review ? 'Submit request' : 'Review request'}</Text></Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' }, backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: { maxHeight: '90%', flexShrink: 1, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: colors.white }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderGray, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: layout.screenGutter, paddingBottom: 22 }, headerCopy: { flex: 1, gap: 6 }, title: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary }, secondary: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }, close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  rental: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 17, backgroundColor: colors.backgroundLight }, carImage: { width: 85, height: 65 }, rentalCopy: { flex: 1, gap: 6 },
  content: { paddingHorizontal: layout.screenGutter, paddingBottom: 24, gap: 23 }, field: { gap: 10 }, label: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, option: { borderRadius: 22, borderWidth: 1, borderColor: colors.borderGray, paddingHorizontal: 14, paddingVertical: 12 }, selected: { borderColor: colors.primaryBrandBlue, backgroundColor: '#EDF2FF' }, optionText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }, selectedText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primaryBrandBlue },
  input: { backgroundColor: colors.backgroundLight, borderRadius: 14, padding: 15, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.textPrimary }, textArea: { minHeight: 115 }, body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, color: colors.textSecondary }, note: { padding: 15, borderRadius: 15, backgroundColor: '#EDF2FF' }, summary: { gap: 22, padding: 18, borderRadius: 18, backgroundColor: colors.backgroundLight }, error: { color: colors.error, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: layout.screenGutter, paddingTop: 12 }, button: { flex: 1, minHeight: 49, borderRadius: 26, backgroundColor: colors.primaryBrandBlue, justifyContent: 'center', alignItems: 'center' }, buttonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white }, edit: { minWidth: 75, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF2FF', borderRadius: 26 },
});

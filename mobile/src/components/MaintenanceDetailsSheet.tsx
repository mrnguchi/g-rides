import { MaintenanceVisitProgress } from './MaintenanceVisitProgress';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { maintenanceServiceLabels, maintenanceStatusLabels, useMaintenanceFlow, type MaintenanceBooking } from './MaintenanceFlowProvider';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout, moneyText, statusText } from '../theme';

const money = (value: number) => `${value.toLocaleString('en-US')} XAF`;
const date = (value: string) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function MaintenanceDetailsSheet({ request, onClose }: { request: MaintenanceBooking; onClose: () => void }) {
  const { decideQuote } = useMaintenanceFlow();
  const insets = useSafeAreaInsets();
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'decline'>();
  const back = () => decision ? setDecision(undefined) : onClose();
  const gestures = useScreenBackNavigation(back);
  const quote = request.quote;
  const total = quote?.labour.reduce((sum, line) => sum + line.amountXaf, 0) ?? 0;
  const needsDecision = request.status === 'quoted' && !!quote;
  const approved = request.status === 'confirmed' || request.status === 'in_progress';
  const declined = request.status === 'quote_declined';
  return <Modal transparent visible animationType="slide" onRequestClose={back}>
    <View style={s.root} {...gestures}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close maintenance details" style={s.backdrop} onPress={onClose} />
      <View accessibilityViewIsModal style={[s.sheet, { marginTop: insets.top + 20 }]}>
        <View style={s.handle} />
        <View style={s.header}><View style={s.flex}><Text style={s.title}>{decision ? decision === 'approve' ? 'Approve this quote?' : 'Decline this quote?' : needsDecision ? 'Review your quote' : 'Maintenance details'}</Text><Text style={s.secondary}>{request.reference}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close maintenance details" style={s.close} onPress={onClose}><AppIcon name="close" size={20} /></Pressable></View>
        <ScrollView key={decision ?? request.status} showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          {decision ? <View style={s.panel}>
            <Text style={s.heading}>{request.garage.name}</Text>
            <Text style={s.total}>{money(total)}</Text>
            <Text style={s.body}>{decision === 'approve' ? 'You are approving only the work listed in this quote and the proposed visit. Any extra work or parts will need your approval separately.' : 'This quote will be declined and the request will move to History. No work will be authorised. You can make a new request when you are ready.'}</Text>
            <Text style={s.secondary}>{decision === 'approve' ? 'Approving this quote does not take a payment.' : 'No payment has been taken.'}</Text>
          </View> : <>
            <View style={s.garage}>{request.garage.flyer ? <Image source={request.garage.flyer} accessibilityLabel={request.garage.name} resizeMode="cover" style={s.garageImage} /> : <View style={s.garageIcon}><AppIcon name="fleet" size={25} color={colors.primaryBrandBlue} /></View>}<View style={s.flex}><Text style={s.heading}>{request.garage.name}</Text><Text style={s.secondary}>{request.garage.areaLabel}</Text></View></View>
            <View style={[s.status, needsDecision && s.attention]}><View style={[s.dot, needsDecision && { backgroundColor: colors.orange }]} /><Text style={s.statusText}>{maintenanceStatusLabels[request.status]}</Text></View>
            {declined && <View style={s.panel}><Text style={s.heading}>Quote declined</Text><Text style={s.body}>No work has been authorised. This request is now in Activity → History.</Text></View>}
            <View style={s.vehicle}><Image source={request.rental.vehicle.image} resizeMode="contain" style={s.carImage} /><View style={s.flex}><Text style={s.heading}>{request.rental.vehicle.brand} {request.rental.vehicle.model}</Text><Text style={s.secondary}>Rental · {request.rental.bookingReference}</Text></View></View>
            {approved && <MaintenanceVisitProgress request={request} />}
            {approved && <Pressable accessibilityRole="button" accessibilityState={{ expanded: quoteExpanded }} onPress={() => setQuoteExpanded(value => !value)} style={s.quoteToggle}><View style={s.flex}><Text style={s.heading}>Approved quote</Text><Text style={s.secondary}>View the agreed work and cost breakdown</Text></View><Text style={s.amount}>{money(total)}</Text><View style={{ transform: [{ rotate: quoteExpanded ? '-90deg' : '90deg' }] }}><AppIcon name="chevronRight" size={18} color={colors.primaryBrandBlue} /></View></Pressable>}
            {(!approved || quoteExpanded) && <>
            <View style={s.section}><Text style={s.heading}>{maintenanceServiceLabels[request.service]}</Text><Text style={s.body}>{request.issue}</Text></View>
            {quote ? <>
              <View style={s.section}><Text style={s.heading}>{approved ? 'Approved work' : 'Proposed work'}</Text><Text style={s.body}>{quote.work}</Text></View>
              <View style={s.panel}>
                <Text style={s.heading}>{approved ? 'Confirmed visit' : 'Proposed visit'}</Text>
                <View style={s.row}><Text style={s.body}>{date(quote.visitAt)}</Text><Text style={s.value}>{new Date(quote.visitAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text></View>
                <Text style={s.secondary}>{quote.duration} · At the garage</Text>
              </View>
              <View style={s.section}><Text style={s.heading}>Cost breakdown</Text>
                {quote.labour.map((line, index) => <View key={`${line.label}-${index}`} style={s.row}><Text style={[s.body, s.flex]}>{line.label}</Text><Text style={s.amount}>{money(line.amountXaf)}</Text></View>)}
                <View style={s.row}><Text style={s.body}>Replacement parts</Text><Text style={s.secondary}>None required</Text></View>
                <View style={s.totalRow}><Text style={s.heading}>Total</Text><Text style={s.total}>{money(total)}</Text></View>
                <Text style={s.secondary}>No additional charges are included in this quote.</Text>
              </View>
              <View style={s.note}><Text style={s.body}>Any additional work or replacement parts must be quoted and approved before they are added.</Text></View>
              {request.decidedAt && <Text style={s.secondary}>{approved ? 'Approved' : 'Declined'} on {date(request.decidedAt)}</Text>}
            </> : <View style={s.panel}><Text style={s.heading}>What happens next?</Text><Text style={s.body}>The garage will assess your request and provide a quote for your approval.</Text><Text style={s.secondary}>Preferred visit: {date(request.preferredDate + 'T12:00:00')}. Availability is not confirmed yet.</Text></View>}
            </>}
          </>}
        </ScrollView>
        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {decision ? <>
            <Pressable accessibilityRole="button" onPress={() => setDecision(undefined)} style={s.secondaryButton}><Text style={s.secondaryButtonText}>Go back</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => { decideQuote(request.id, decision); setDecision(undefined); }} style={s.primaryButton}><Text style={s.primaryButtonText}>{decision === 'approve' ? 'Confirm approval' : 'Decline quote'}</Text></Pressable>
          </> : needsDecision ? <>
            <Pressable accessibilityRole="button" onPress={() => setDecision('decline')} style={s.secondaryButton}><Text style={s.secondaryButtonText}>Decline</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => setDecision('approve')} style={s.primaryButton}><Text style={s.primaryButtonText}>Approve quote</Text></Pressable>
          </> : <Pressable accessibilityRole="button" onPress={onClose} style={s.primaryButton}><Text style={s.primaryButtonText}>Done</Text></Pressable>}
        </View>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' }, backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: { maxHeight: '90%', flexShrink: 1, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 }, handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: colors.borderGray, marginTop: 12, marginBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenGutter, paddingBottom: 22, gap: 12 }, flex: { flex: 1, gap: 5 }, title: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.textPrimary }, close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.backgroundLight, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: layout.screenGutter, paddingBottom: 24, gap: 23 }, section: { gap: 14 }, heading: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary, lineHeight: 22 }, body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, color: colors.textSecondary }, secondary: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 20, color: colors.textSecondary },
  garage: { flexDirection: 'row', alignItems: 'center', gap: 12 }, garageIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDF2FF' },
  quoteToggle: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: 16, borderRadius: 18, backgroundColor: colors.backgroundLight },
  garageImage: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.backgroundLight },
  status: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#EDF2FF' }, attention: { backgroundColor: `${colors.orange}16` }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryBrandBlue }, statusText: { ...statusText, fontSize: 12, color: colors.textPrimary },
  panel: { backgroundColor: colors.backgroundLight, borderRadius: 18, padding: 17, gap: 12 }, vehicle: { flexDirection: 'row', alignItems: 'center', gap: 14 }, carImage: { width: 85, height: 66 }, row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, value: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary }, amount: { ...moneyText, fontSize: 15, color: colors.textPrimary }, totalRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: colors.borderGray, paddingTop: 17 }, total: { ...moneyText, fontSize: 22, color: colors.primaryBrandBlue }, note: { backgroundColor: '#EDF2FF', borderRadius: 17, padding: 16 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: layout.screenGutter, paddingTop: 12 }, primaryButton: { flex: 1, minHeight: 49, borderRadius: 26, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryBrandBlue }, primaryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white }, secondaryButton: { minWidth: 90, minHeight: 49, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: '#EDF2FF' }, secondaryButtonText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primaryBrandBlue },
});

import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppIcon } from '../components/AppIcon';
import { MaintenanceRequestSheet } from '../components/MaintenanceRequestSheet';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { MaintenanceProvider, MaintenanceServiceType } from '../types/maintenance';

const services: Record<MaintenanceServiceType, { title: string; description: string }> = {
  oil_and_filter_change: { title: 'Oil & filter change', description: 'Routine engine care' },
  diagnostics: { title: 'Diagnostics', description: 'Identify vehicle issues' },
  inspection: { title: 'Inspection', description: 'Check your vehicle’s condition' },
  battery_service: { title: 'Battery service', description: 'Battery checks and care' },
  tyre_service: { title: 'Tyre service', description: 'Tyre checks and care' },
};
const tabs = ['About', 'Reviews'] as const;

export function GarageDetailScreen({ garage, onBack }: { garage: MaintenanceProvider; onBack: () => void }) {
  const [tab, setTab] = useState<typeof tabs[number]>('About');
  const insets = useSafeAreaInsets();
  const [requestOpen, setRequestOpen] = useState(false);
  const backHandlers = useScreenBackNavigation(onBack, !requestOpen);
  const serviceType = garage.fulfillment.includes('mobile')
    ? garage.fulfillment.includes('garage') ? 'Garage & mobile service' : 'Mobile service'
    : 'Garage visit';
  return <View style={s.screen} {...backHandlers}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top']} style={s.headerSafe}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Maintenance" onPress={onBack} style={s.back}>
          <View style={s.backArrow}><AppIcon name="arrowForward" size={21} /></View>
        </Pressable>
        <Text style={s.headerTitle}>Garage details</Text><View style={s.spacer} />
      </View>
    </SafeAreaView>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
      <View style={s.hero}>
        {garage.flyer ? <Image source={garage.flyer} accessibilityLabel={garage.name} resizeMode="cover" style={s.heroImage} /> : <AppIcon name="fleet" size={60} color={colors.primaryBrandBlue} />}
      </View>
      <View style={s.sheet}>
        <View style={s.summary}>
          <View style={s.summaryRow}><Text style={s.category}>Maintenance</Text><Text style={s.quote}>Quote on request</Text></View>
          <Text style={s.name}>{garage.name}</Text>
          <View style={s.location}><AppIcon name="location" size={17} color={colors.primaryBrandBlue} /><Text style={s.secondary}>{garage.areaLabel ?? garage.serviceAreas.join(', ')}</Text></View>
        </View>
        <View accessibilityRole="tablist" style={s.tabs}>{tabs.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: tab === value }} onPress={() => setTab(value)} style={[s.tab, tab === value && s.activeTab]}><Text style={[s.tabText, tab === value && s.activeTabText]}>{value}</Text></Pressable>)}</View>
        {tab === 'About' ? <View style={s.content}>
          <View style={s.section}><Text style={s.heading}>About the garage</Text><Text style={s.description}>{garage.description}</Text></View>
          <View style={s.facts}>
            <View style={s.fact}><Text style={s.factLabel}>Service type</Text><Text style={s.factValue}>{serviceType}</Text></View>
            <View style={s.fact}><Text style={s.factLabel}>Pricing</Text><Text style={s.factValue}>After assessment</Text></View>
          </View>
          <View style={s.section}>
            <Text style={s.heading}>Services offered</Text>
            <View style={s.services}>{garage.maintenanceServices.map(key => <View key={key} style={s.service}>
              <View style={s.serviceMark}><View style={s.dot} /></View>
              <View style={s.serviceCopy}><Text style={s.serviceTitle}>{services[key].title}</Text><Text style={s.serviceDescription}>{services[key].description}</Text></View>
            </View>)}</View>
          </View>
          <View style={s.section}><Text style={s.heading}>Before your visit</Text><Text style={s.description}>Describe the issue and share your vehicle details. The garage will assess the work and prepare a quote for you to review.</Text></View>
          <View style={s.note}><View style={s.noteAccent} /><View style={s.noteCopy}><Text style={s.noteTitle}>Only the work you approve</Text><Text style={s.description}>Parts are only added when needed. Review any replacement parts or extra work before approving your quote.</Text></View></View>
        </View> : <View style={s.content}>
          <View style={s.empty}><View style={s.reviewIcon}><AppIcon name="messages" size={28} color={colors.primaryBrandBlue} /></View><Text style={s.heading}>No reviews yet</Text><Text style={s.emptyDescription}>Customer experiences with this garage will appear here.</Text></View>
        </View>}
      </View>
    </ScrollView>
    <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={s.footerCopy}><Text style={s.footerTitle}>Quote on request</Text><Text style={s.footerHint}>Review costs before approval</Text></View>
      <Pressable accessibilityRole="button" onPress={() => setRequestOpen(true)} style={({ pressed }) => [s.requestButton, pressed && { opacity: 0.75 }]}><Text style={s.requestText}>Request service</Text><AppIcon name="arrowUpRight" size={18} color={colors.white} /></Pressable>
    </View>
    <MaintenanceRequestSheet garage={garage} visible={requestOpen} onClose={() => setRequestOpen(false)} />
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  headerSafe: { backgroundColor: '#F7F7F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenGutter, paddingTop: 22, paddingBottom: 16 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: '#EBECF0', justifyContent: 'center', alignItems: 'center' },
  backArrow: { transform: [{ rotate: '180deg' }] }, spacer: { width: 44 },
  headerTitle: { fontFamily: fonts.medium, fontSize: 16, color: colors.textPrimary },
  hero: { height: 280, backgroundColor: colors.surfaceGray, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: '100%' },
  sheet: { marginTop: -26, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  summary: { paddingHorizontal: layout.screenGutter, paddingTop: 25, paddingBottom: 20, gap: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  category: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryBrandBlue, backgroundColor: '#EDF2FF', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6 },
  quote: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
  name: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 29, color: colors.textPrimary },
  location: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  secondary: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textSecondary, flexShrink: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: layout.screenGutter, borderBottomWidth: 1, borderBottomColor: '#ECEEF2' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primaryBrandBlue },
  tabText: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary }, activeTabText: { color: colors.primaryBrandBlue },
  content: { paddingHorizontal: layout.screenGutter, paddingTop: 25, gap: 25 },
  section: { gap: 10 }, heading: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.textPrimary },
  description: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, color: colors.textSecondary },
  facts: { flexDirection: 'row', backgroundColor: colors.backgroundLight, borderRadius: 17, padding: 17, gap: 14 },
  fact: { flex: 1, gap: 8 }, factLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary }, factValue: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: colors.textPrimary },
  services: { gap: 17, paddingTop: 7 }, service: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  serviceMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.backgroundLight, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange }, serviceCopy: { flex: 1, gap: 4 },
  serviceTitle: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.textPrimary }, serviceDescription: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, color: colors.textSecondary },
  note: { flexDirection: 'row', borderRadius: 17, backgroundColor: '#F3F6FC', padding: 16, gap: 12 }, noteAccent: { width: 3, borderRadius: 2, backgroundColor: colors.orange }, noteCopy: { flex: 1, gap: 7 }, noteTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, paddingHorizontal: layout.screenGutter, paddingTop: 16, backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 8 },
  footerCopy: { flex: 1, minWidth: 120, gap: 5 }, footerTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary }, footerHint: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, color: colors.textSecondary },
  requestButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, paddingHorizontal: 18, borderRadius: 26, backgroundColor: colors.primaryBrandBlue }, requestText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.white },
  empty: { alignItems: 'center', padding: 25, gap: 14, backgroundColor: colors.backgroundLight, borderRadius: 20 }, reviewIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center' }, emptyDescription: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23, textAlign: 'center', color: colors.textSecondary },
});

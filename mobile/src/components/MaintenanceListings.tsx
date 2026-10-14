import { useState } from 'react';
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GarageDetailScreen } from '../screens/GarageDetailScreen';
import { AppIcon } from './AppIcon';
import { colors, fonts, layout, shadows } from '../theme';
import { MOCK_MAINTENANCE_PROVIDERS } from '../constants/mockMaintenance';
import type { MaintenanceProvider, MaintenanceServiceType } from '../types/maintenance';

const serviceLabels: Record<MaintenanceServiceType, string> = {
  oil_and_filter_change: 'Oil & filter change', diagnostics: 'Diagnostics', inspection: 'Inspection',
  battery_service: 'Battery service', tyre_service: 'Tyre service',
};
const areas = ['All areas', ...new Set(MOCK_MAINTENANCE_PROVIDERS.flatMap(provider => provider.serviceAreas))];

export function MaintenanceListings() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [service, setService] = useState<MaintenanceServiceType>();
  const [area, setArea] = useState('All areas');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<MaintenanceProvider>();
  const garages = MOCK_MAINTENANCE_PROVIDERS.filter(provider =>
    (!service || provider.maintenanceServices.includes(service)) &&
    (area === 'All areas' || provider.serviceAreas.includes(area)) &&
    [provider.name, provider.areaLabel, ...provider.maintenanceServices.map(key => serviceLabels[key])].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  const reset = () => { setQuery(''); setService(undefined); setArea('All areas'); };
  const close = () => setSelected(undefined);
  return <View style={s.root}>
    <View style={s.searchRow}><View style={s.search}><AppIcon name="discover" size={21} color={colors.textSecondary} /><TextInput accessibilityLabel="Search garages, services or areas" placeholder="Search garages or services" placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} returnKeyType="search" style={s.input} />{!!query && <Pressable accessibilityRole="button" accessibilityLabel="Clear garage search" hitSlop={8} onPress={() => setQuery('')}><AppIcon name="close" size={18} /></Pressable>}</View><Pressable accessibilityRole="button" accessibilityLabel="Filter garages by area" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(!filtersOpen)} style={[s.filter, (filtersOpen || area !== 'All areas') && s.selectedChip]}><Image source={require('../../assets/images/filter.png')} style={s.filterIcon} /></Pressable></View>
    <FlatList data={garages} keyExtractor={item => item.id} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[s.list, { paddingBottom: 120 + insets.bottom }]}
      ListHeaderComponent={<>
        {filtersOpen && <View style={s.areaBlock}><Text style={s.label}>Service area</Text><View style={s.chips}>{areas.map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === area }} onPress={() => setArea(value)} style={[s.chip, value === area && s.selectedChip]}><Text style={[s.chipText, value === area && s.blue]}>{value}</Text></Pressable>)}</View></View>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.serviceFilters}><Pressable accessibilityRole="button" accessibilityState={{ selected: !service }} onPress={() => setService(undefined)} style={[s.chip, !service && s.selectedChip]}><Text style={[s.chipText, !service && s.blue]}>All services</Text></Pressable>{Object.entries(serviceLabels).map(([key, label]) => <Pressable key={key} accessibilityRole="button" accessibilityState={{ selected: service === key }} onPress={() => setService(key as MaintenanceServiceType)} style={[s.chip, service === key && s.selectedChip]}><Text style={[s.chipText, service === key && s.blue]}>{label}</Text></Pressable>)}</ScrollView>
        <View style={s.listHeader}><Text style={s.heading}>Find a garage</Text><Text style={s.muted}>{garages.length} {garages.length === 1 ? 'garage' : 'garages'} to explore</Text></View>
      </>}
      ListEmptyComponent={<View style={s.empty}><View style={s.emptyIcon}><AppIcon name="fleet" size={30} color={colors.primaryBrandBlue} /></View><Text style={s.name}>No garages found</Text><Text style={s.emptyText}>Try another service, area or search.</Text><Pressable accessibilityRole="button" onPress={reset} style={s.reset}><Text style={s.link}>Reset filters</Text></Pressable></View>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}, ${item.areaLabel}`} onPress={() => setSelected(item)} style={({ pressed }) => [cards.card, pressed && s.pressed]}>
        <Image source={item.flyer} resizeMode="cover" style={cards.thumbnail} />
        <View style={cards.copy}>
          <View style={cards.titleRow}><Text style={cards.name}>{item.name}</Text><AppIcon name="chevronRight" size={18} color={colors.primaryBrandBlue} /></View>
          <View style={cards.location}><AppIcon name="location" size={13} color={colors.textSecondary} /><Text style={cards.locationText}>{item.areaLabel}</Text></View>
          <View style={cards.services}>{item.maintenanceServices.slice(0, 2).map(key => <View key={key} style={cards.tag}><Text style={cards.tagText}>{serviceLabels[key]}</Text></View>)}{item.maintenanceServices.length > 2 && <Text style={cards.more}>+{item.maintenanceServices.length - 2}</Text>}</View>
          <View style={cards.footer}><Text style={cards.caption}>Quote on request</Text><Text style={cards.quote}>Visit garage</Text></View>
        </View>
      </Pressable>}
    />
    <Modal visible={!!selected} presentationStyle="fullScreen" animationType="slide" onRequestClose={close}><SafeAreaProvider>{selected && <GarageDetailScreen key={selected.id} garage={selected} onBack={close} />}</SafeAreaProvider></Modal>
  </View>;
}

const cards = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 16, borderRadius: 20, backgroundColor: colors.white, ...shadows.soft },
  thumbnail: { width: 72, height: 82, borderRadius: 15, backgroundColor: colors.surfaceGray },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  services: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 10 },
  tag: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#F0F4FC' },
  tagText: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 14, color: colors.primaryBrandBlue },
  more: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, marginTop: 10 },
  caption: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, color: colors.textSecondary },
  quote: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, color: colors.orange },
});
const s = StyleSheet.create({
  root: { flex: 1 }, flex: { flex: 1 }, searchRow: { flexDirection: 'row', gap: 10, marginHorizontal: layout.screenGutter, marginBottom: 8 }, search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.backgroundLight }, input: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.textPrimary }, filter: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.surfaceGray, alignItems: 'center', justifyContent: 'center' }, filterIcon: { width: 22, height: 22, tintColor: colors.primaryDark },
  list: { paddingHorizontal: layout.screenGutter }, areaBlock: { paddingVertical: 12, gap: 10 }, label: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textPrimary }, serviceFilters: { gap: 8, paddingVertical: 12 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { backgroundColor: colors.backgroundLight, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10 }, selectedChip: { backgroundColor: '#EDF2FF' }, chipText: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 13 }, blue: { color: colors.primaryBrandBlue }, listHeader: { marginTop: 8, marginBottom: 20, gap: 5 }, heading: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 21 }, muted: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.textSecondary },
  card: { borderRadius: 24, backgroundColor: colors.white, marginBottom: 24, ...shadows.soft }, flyerFrame: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', backgroundColor: '#F3F4F6' }, flyer: { width: '100%', height: 225 }, cardBody: { padding: 18, gap: 12 }, name: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 25, color: colors.textPrimary }, location: { flexDirection: 'row', alignItems: 'center', gap: 7 }, serviceChip: { backgroundColor: '#F3F6FC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }, serviceText: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryBrandBlue }, cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8 }, orange: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.orange }, caption: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 4 }, cta: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 24, backgroundColor: colors.primaryBrandBlue, minHeight: 44, paddingHorizontal: 13 }, ctaText: { fontFamily: fonts.medium, color: colors.white, fontSize: 12 }, pressed: { opacity: 0.8 },
  empty: { alignItems: 'center', gap: 14, paddingVertical: 35 }, emptyIcon: { backgroundColor: '#EDF2FF', borderRadius: 22, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }, emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }, reset: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 22, backgroundColor: '#EDF2FF' }, link: { fontFamily: fonts.medium, fontSize: 13, color: colors.primaryBrandBlue },
});

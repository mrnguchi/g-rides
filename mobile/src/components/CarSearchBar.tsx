import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts } from '../theme';
import { AppIcon } from './AppIcon';

export function CarSearchBar({ value, onChangeText, onFilterPress, filtersExpanded, filterCount = 0 }: {
  value: string; onChangeText: (value: string) => void; onFilterPress: () => void;
  filtersExpanded?: boolean; filterCount?: number;
}) {
  return <View style={s.row}>
    <View style={s.search}><AppIcon name="discover" size={21} color={colors.textSecondary} /><TextInput accessibilityLabel="Search cars" placeholder="Search brand or model" placeholderTextColor={colors.textSecondary} value={value} onChangeText={onChangeText} autoCapitalize="none" autoCorrect={false} returnKeyType="search" style={s.input} />{!!value && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => onChangeText('')}><AppIcon name="close" size={18} /></Pressable>}</View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Filters${filterCount ? `, ${filterCount} active` : ''}`} accessibilityState={filtersExpanded === undefined ? undefined : { expanded: filtersExpanded }} onPress={onFilterPress} style={[s.filter, filtersExpanded && s.selected]}><Image source={require('../../assets/images/filter.png')} style={s.icon} />{filterCount > 0 && <View style={s.dot} />}</Pressable>
  </View>;
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.backgroundLight, height: 50 },
  input: { flex: 1, fontFamily: fonts.regular, color: colors.textPrimary, fontSize: 15 },
  filter: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceGray },
  selected: { backgroundColor: '#EDF4FE' }, icon: { width: 22, height: 22, resizeMode: 'contain', tintColor: colors.primaryDark }, dot: { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryBrandBlue },
});

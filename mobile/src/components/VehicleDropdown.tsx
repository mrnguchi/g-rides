import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors } from '../theme';

export function VehicleDropdown({ label, value, options, open, disabled, onToggle, onSelect }: {
  label: string; value: string; options: readonly string[]; open: boolean; disabled?: boolean;
  onToggle: () => void; onSelect: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const matching = options.filter(option => option.toLowerCase().includes(query.toLowerCase()));
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || 'Select'}`} accessibilityState={{ expanded: open, disabled }} disabled={disabled} onPress={() => { setQuery(''); onToggle(); }} style={[styles.trigger, open && styles.active, disabled && { opacity: 0.5 }]}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value || `Select ${label.toLowerCase()}`}</Text><View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}><AppIcon name="chevronRight" size={18} color={colors.primaryBrandBlue} /></View>
    </Pressable>
    {open && <View style={styles.menu}>
      {options.length > 6 && <TextInput accessibilityLabel={`Search ${label.toLowerCase()}`} placeholder="Search options" placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery} style={styles.search} autoCorrect={false} />}
      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={styles.options}>
        {matching.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: value === option }} onPress={() => onSelect(option)} style={[styles.option, value === option && styles.selected]}><Text style={styles.optionText}>{option}</Text>{value === option && <AppIcon name="verified" size={18} color={colors.primaryBrandBlue} />}</Pressable>)}
        {!matching.length && <Text style={styles.empty}>No matching options</Text>}
      </ScrollView>
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  field: { marginTop: 18 }, label: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 9 }, trigger: { minHeight: 52, borderRadius: 16, backgroundColor: colors.backgroundLight, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.borderGray }, active: { borderColor: colors.primaryBrandBlue }, value: { flex: 1, color: colors.textPrimary, fontSize: 15 }, placeholder: { color: colors.textSecondary }, menu: { marginTop: 8, padding: 8, borderRadius: 16, backgroundColor: colors.backgroundLight }, search: { backgroundColor: colors.white, padding: 12, borderRadius: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 6 }, options: { maxHeight: 180 }, option: { minHeight: 44, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10 }, optionText: { flex: 1, color: colors.textPrimary, fontSize: 14 }, selected: { backgroundColor: '#E7EEFF' }, empty: { padding: 15, fontSize: 14, color: colors.textSecondary },
});

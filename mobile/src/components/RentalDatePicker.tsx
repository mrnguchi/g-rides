import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppIcon } from './AppIcon';
import { colors, fonts } from '../theme';

const keyFor = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dateFor = (key: string) => new Date(`${key}T12:00:00`);
export function RentalDatePicker({ start, end, onChange, singleDate = false }: { start: string; end: string; onChange: (start: string, days: number) => void; singleDate?: boolean }) {
  const [month, setMonth] = useState(() => new Date(dateFor(start).getFullYear(), dateFor(start).getMonth(), 1));
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const today = keyFor(new Date());
  const cells = Array.from({ length: month.getDay() }, () => 0).concat(Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, i) => i + 1));
  const choose = (key: string) => {
    if (singleDate) { onChange(key, 1); return; }
    if (selecting === 'start') { onChange(key, 1); setSelecting('end'); }
    else {
      // UTC day arithmetic avoids daylight-saving shifts.
      const days = Math.round((Date.parse(`${key}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
      onChange(start, days); setSelecting('start');
    }
  };
  return <View style={styles.box}>
    <View style={styles.row}>{(singleDate ? ['start'] as const : ['start', 'end'] as const).map((part) => <Pressable key={part} onPress={() => setSelecting(part)} accessibilityRole="button" style={[styles.dateButton, selecting === part && styles.selected]}><Text style={styles.label}>{singleDate ? 'Preferred visit date' : part === 'start' ? 'Pickup date' : 'Return date'}</Text><Text style={styles.value}>{dateFor(part === 'start' ? start : end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text></Pressable>)}</View>
    <View style={styles.monthRow}><Pressable accessibilityLabel="Previous month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} style={styles.arrow}><View style={{ transform: [{ rotate: '180deg' }] }}><AppIcon name="chevronRight" size={20} /></View></Pressable><Text style={styles.value}>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityLabel="Next month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.arrow}><AppIcon name="chevronRight" size={20} /></Pressable></View>
    <View style={styles.grid}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <Text key={i} style={styles.weekday}>{day}</Text>)}{cells.map((day, i) => {
      if (!day) return <View key={`blank-${i}`} style={styles.day} />;
      const key = keyFor(new Date(month.getFullYear(), month.getMonth(), day));
      const disabled = key < today || (selecting === 'end' && key <= start);
      const selected = key === start || key === end;
      return <Pressable key={key} disabled={disabled} accessibilityRole="button" accessibilityLabel={key} accessibilityState={{ disabled, selected }} onPress={() => choose(key)} style={[styles.day, key > start && key < end && styles.range, selected && styles.selected]}><Text style={[styles.value, disabled && styles.disabled]}>{day}</Text></Pressable>;
    })}</View>
  </View>;
}
const styles = StyleSheet.create({
  box: { gap: 10 }, row: { flexDirection: 'row', gap: 10 }, dateButton: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.backgroundLight, gap: 6 }, selected: { backgroundColor: '#EDF4FE' }, label: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary }, value: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary }, monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, arrow: { padding: 12 }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.2857%', textAlign: 'center', color: colors.textSecondary, paddingVertical: 8 }, day: { width: '14.2857%', minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8 }, range: { backgroundColor: colors.backgroundLight }, disabled: { opacity: 0.25 },
});

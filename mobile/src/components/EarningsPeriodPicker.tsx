import { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OWNER_EARNINGS_PERIODS, getOwnerEarningsPeriod, type OwnerEarningsPeriod } from '../constants/mockOwnerEarnings';
import { colors, fonts, shadows } from '../theme';
import { AppIcon } from './AppIcon';

export function EarningsPeriodPicker({ value, onChange, inverted = false }: { value: OwnerEarningsPeriod; onChange: (period: OwnerEarningsPeriod) => void; inverted?: boolean }) {
  const trigger = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; bottom: number }>();
  const { width, height } = useWindowDimensions();
  useEffect(() => setAnchor(undefined), [width, height]);
  const insets = useSafeAreaInsets();
  const menuWidth = Math.min(260, width - 32);
  const top = Math.max(insets.top + 8, Math.min(anchor?.bottom ?? 0, height - insets.bottom - 320));
  const close = () => setAnchor(undefined);
  return <>
    <Pressable ref={trigger} accessibilityRole="button" accessibilityLabel={`${getOwnerEarningsPeriod(value).heading}. Change timeframe`} accessibilityState={{ expanded: !!anchor }} onPress={() => trigger.current?.measureInWindow((x, y, _w, h) => setAnchor({ x, bottom: y + h + 8 }))} style={styles.trigger}>
      <Text style={[styles.caption, inverted && { color: '#CBD5E1' }]}>{getOwnerEarningsPeriod(value).heading.toUpperCase()}</Text>
      <View style={{ transform: [{ rotate: anchor ? '-90deg' : '90deg' }] }}><AppIcon name="chevronRight" size={17} color={inverted ? colors.white : colors.primaryBrandBlue} /></View>
    </Pressable>
    <Modal transparent visible={!!anchor} animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close timeframe menu" onPress={close} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={[styles.menu, { top, left: Math.max(16, Math.min(anchor?.x ?? 16, width - menuWidth - 16)), width: menuWidth, maxHeight: height - top - insets.bottom - 16 }]}>
          <Text style={styles.title}>Earnings timeframe</Text>
          <ScrollView bounces={false}>{OWNER_EARNINGS_PERIODS.map(period => <Pressable key={period.id} accessibilityRole="radio" accessibilityState={{ checked: value === period.id }} onPress={() => { onChange(period.id); close(); }} style={({ pressed }) => [styles.option, value === period.id && styles.selected, pressed && styles.pressed]}>
            <Text style={[styles.label, value === period.id && styles.selectedLabel]}>{period.label}</Text>
            {value === period.id && <Ionicons name="checkmark" size={20} color={colors.primaryBrandBlue} />}
          </Pressable>)}</ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  trigger: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  caption: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 12, letterSpacing: 0.7, color: '#566174', flexShrink: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.08)' },
  menu: { position: 'absolute', backgroundColor: colors.white, borderRadius: 20, padding: 10, ...shadows.floating },
  title: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary, paddingHorizontal: 12, paddingVertical: 10 },
  option: { minHeight: 46, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { flex: 1, fontFamily: fonts.medium, fontWeight: '500', fontSize: 14, color: colors.textPrimary },
  selected: { backgroundColor: '#EDF4FE' }, selectedLabel: { color: colors.primaryBrandBlue, fontFamily: fonts.semiBold, fontWeight: '600' }, pressed: { opacity: 0.65 },
});

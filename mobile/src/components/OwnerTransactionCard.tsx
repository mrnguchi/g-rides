import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { AppIcon } from './AppIcon';
import { colors, moneyText, statusText } from '../theme';
import type { OWNER_TRANSACTIONS } from '../constants/mockOwnerEarnings';

type Transaction = typeof OWNER_TRANSACTIONS[number];

export function OwnerTransactionCard({ item, expanded, onToggle }: {
  item: Transaction; expanded: boolean; onToggle: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: expanded ? 1 : 0, duration: reduceMotion ? 0 : 260, easing: Easing.inOut(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [expanded, reduceMotion, progress]);
  const incoming = item.direction === 'incoming';
  const amount = `${incoming ? '+' : '−'}${item.amount.toLocaleString('en-US')} XAF`;
  const date = new Date(`${item.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const description = item.title === 'Rental payment' ? 'Payment received for a vehicle rental.' : item.title === 'Rental settlement' ? 'Combined income from completed rental bookings.' : item.title === 'Withdrawal' ? 'Funds paid out from your available balance.' : 'Combined record of earlier completed withdrawals.';
  const details = <View style={styles.details}>
    {[
      ['Transaction ID', item.id], ['Date', date], ['Reference', item.reference],
      [incoming ? 'Payment method' : 'Payout method', item.title === 'Withdrawal' ? 'Mobile money' : 'Not specified'],
      ['Status', 'Completed'],
    ].map(([label, value]) => <View key={label} style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={[styles.detailValue, label === 'Status' && statusText]}>{value}</Text></View>)}
    <Text style={styles.description}>{description}</Text>
  </View>;
  return <View style={styles.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${item.title}, ${amount}, ${date}`} accessibilityHint={expanded ? 'Collapse transaction details' : 'Expand transaction details'} accessibilityState={{ expanded }} onPress={onToggle} style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.75 }]}>
      <View style={styles.top}><View style={[styles.icon, incoming && styles.incomingIcon]}><View style={{ transform: [{ rotate: incoming ? '180deg' : '0deg' }] }}><AppIcon name="arrowUpRight" size={23} color={incoming ? '#287E48' : colors.primaryBrandBlue} /></View></View><View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.reference}>{item.reference}</Text></View>
        <View style={styles.toggle} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><Svg width={18} height={18} viewBox="0 0 18 18"><Line x1={3} y1={9} x2={15} y2={9} stroke={colors.primaryBrandBlue} strokeWidth={1.8} strokeLinecap="round" />{!expanded && <Line x1={9} y1={3} x2={9} y2={15} stroke={colors.primaryBrandBlue} strokeWidth={1.8} strokeLinecap="round" />}</Svg></View>
      </View>
      <View style={styles.bottom}><Text style={styles.status}>Completed</Text><Text style={[styles.amount, incoming && { color: '#287E48' }]}>{amount}</Text></View>
    </Pressable>
    <View style={styles.detailsContainer}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.measure} onLayout={event => setHeight(event.nativeEvent.layout.height)}>{details}</View>
      <Animated.View pointerEvents={expanded ? 'auto' : 'none'} accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'} style={{ overflow: 'hidden', height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, height] }), opacity: progress }}>{details}</Animated.View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, marginBottom: 14, shadowColor: colors.primaryDark, shadowOpacity: 0.06, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 3 }, trigger: { padding: 17 }, top: { flexDirection: 'row', alignItems: 'center', gap: 12 }, copy: { flex: 1 }, icon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center' }, incomingIcon: { backgroundColor: '#EAF7EF' }, title: { fontSize: 16, fontWeight: '600', color: colors.textPrimary }, reference: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 5 }, toggle: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center' }, bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 16 }, status: { fontSize: 12, color: colors.textSecondary, backgroundColor: colors.backgroundLight, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, ...statusText }, amount: { fontSize: 18, color: colors.textPrimary, ...moneyText },
  detailsContainer: { marginHorizontal: 17 }, measure: { position: 'absolute', left: 0, right: 0, opacity: 0 }, details: { paddingHorizontal: 13, paddingTop: 8, paddingBottom: 14, marginBottom: 17, borderRadius: 14, backgroundColor: colors.backgroundLight }, detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 7 }, detailLabel: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.textSecondary }, detailValue: { flex: 1.5, textAlign: 'right', fontSize: 13, lineHeight: 20, fontWeight: '500', color: colors.textPrimary }, description: { fontSize: 13, lineHeight: 21, color: colors.textSecondary, marginTop: 10 },
});

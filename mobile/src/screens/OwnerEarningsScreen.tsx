import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { EarningsPeriodPicker } from '../components/EarningsPeriodPicker';
import { OwnerTransactionCard } from '../components/OwnerTransactionCard';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout, moneyText, statusText } from '../theme';
import { MOCK_OWNER_EARNINGS, getOwnerEarningsPeriod, getOwnerTransactions, type OwnerEarningsPeriod } from '../constants/mockOwnerEarnings';

const money = (amount: number) => amount.toLocaleString('en-US');
const filters = ['All', 'Incoming', 'Outgoing'] as const;
const formatDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function OwnerEarningsScreen({ onBack, period, onPeriodChange }: { onBack: () => void; period: OwnerEarningsPeriod; onPeriodChange: (period: OwnerEarningsPeriod) => void }) {
  const backHandlers = useScreenBackNavigation(onBack);
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<typeof filters[number]>('All');
  const [expandedId, setExpandedId] = useState<string>();
  useEffect(() => setExpandedId(undefined), [period, filter]);
  const transactions = getOwnerTransactions(period);
  const incoming = getOwnerEarningsPeriod(period).amount;
  const outgoing = transactions.filter(item => item.direction === 'outgoing').reduce((sum, item) => sum + item.amount, 0);
  const visible = transactions.filter(item => filter === 'All' || item.direction === filter.toLowerCase());
  const dates = [...new Set(visible.map(item => item.date))];
  return <View style={styles.screen} {...backHandlers}>
    <StatusBar style="dark" />
    <SafeAreaView edges={['top']} style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.topRow}><Pressable accessibilityRole="button" accessibilityLabel="Back to dashboard" onPress={onBack} style={styles.back}><View style={{ transform: [{ rotate: '180deg' }] }}><AppIcon name="arrowForward" size={22} color={colors.primaryDark} /></View></Pressable><Text style={styles.title}>My earnings</Text><View style={styles.wallet}><AppIcon name="wallet" color={colors.primaryDark} size={24} /></View></View>
        </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.earningsCardPosition}>
        <ImageBackground source={require('../../assets/images/my earning card bg.jpg')} resizeMode="cover" style={styles.earningsCard} imageStyle={styles.earningsCardImage}>
          <View pointerEvents="none" style={styles.cardOverlay} />
          <View style={styles.period}><EarningsPeriodPicker inverted value={period} onChange={onPeriodChange} /></View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.total}>{money(incoming)} <Text style={styles.currency}>XAF</Text></Text>
          <View style={styles.balances}>
            <View style={styles.balance}><Text style={styles.balanceLabel}>Available balance</Text><Text style={styles.balanceValue}>{money(MOCK_OWNER_EARNINGS.available)} <Text style={styles.smallCurrency}>XAF</Text></Text></View>
            <View style={styles.balance}><Text style={styles.balanceLabel}>Pending payouts</Text><Text style={styles.balanceValue}>{money(MOCK_OWNER_EARNINGS.pending)} <Text style={styles.smallCurrency}>XAF</Text></Text></View>
          </View>
          <View style={styles.cardActions}><Pressable accessibilityRole="button" onPress={() => Alert.alert('Withdraw funds', 'Withdrawals are not available yet. Your available balance is ' + money(MOCK_OWNER_EARNINGS.available) + ' XAF.')} style={({ pressed }) => [styles.withdrawButton, pressed && { opacity: 0.75 }]}><Text style={styles.withdrawText}>Withdraw</Text><AppIcon name="arrowUpRight" size={16} color={colors.primaryDark} /></Pressable></View>
        </ImageBackground>
        </View>
        <Text style={styles.balanceNote}>Current balances · refundable deposits held separately</Text>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
          <Text style={styles.sectionTitle}>Period summary</Text>
          <View style={styles.summary}>
            <View style={styles.summaryItem}><View style={styles.summaryLabel}><View style={{ transform: [{ rotate: '180deg' }] }}><AppIcon name="arrowUpRight" size={18} color={colors.success} /></View><Text style={styles.muted}>Received</Text></View><Text style={[styles.summaryAmount, styles.receivedAmount]}>{money(incoming)} <Text style={styles.summaryCurrency}>XAF</Text></Text></View>
            <View style={styles.summaryItem}><View style={styles.summaryLabel}><AppIcon name="arrowUpRight" size={18} color={colors.primaryBrandBlue} /><Text style={styles.muted}>Withdrawn</Text></View><Text style={[styles.summaryAmount, styles.withdrawnAmount]}>{money(outgoing)} <Text style={styles.summaryCurrency}>XAF</Text></Text></View>
          </View>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <View style={styles.filters}>{filters.map(value => <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.activeFilter]}><Text style={[styles.filterText, filter === value && styles.white]}>{value}</Text></Pressable>)}</View>
          {dates.length === 0 && <View style={styles.empty}><AppIcon name="wallet" size={32} color={colors.primaryBrandBlue} /><Text style={styles.emptyTitle}>No transactions in this view</Text><Text style={styles.muted}>Try a different timeframe or filter.</Text></View>}
          {dates.map(day => <View key={day}><Text style={styles.date}>{formatDate(day)}</Text>{visible.filter(item => item.date === day).map(item => <OwnerTransactionCard key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => setExpandedId(current => current === item.id ? undefined : item.id)} />)}</View>)}
          <Text style={styles.footnote}>Sample transactions · reporting date 18 Oct 2026</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  receivedAmount: { color: colors.success, fontFamily: fonts.moneyExtraBold },
  withdrawnAmount: { color: colors.primaryBrandBlue, fontFamily: fonts.moneyExtraBold },
  screen: { flex: 1, backgroundColor: colors.white }, flex: { flex: 1 }, scrollContent: { flexGrow: 1 },
  header: { paddingHorizontal: layout.screenGutter, paddingTop: 12, paddingBottom: 16, backgroundColor: colors.white }, topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 }, back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' }, title: { flex: 1, fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 22, color: colors.textPrimary }, wallet: { padding: 10 },
  earningsCardPosition: { marginHorizontal: layout.screenGutter, marginTop: 8, borderRadius: 24, backgroundColor: '#111111', shadowColor: '#000000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  earningsCard: { minHeight: 280, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 18, borderRadius: 24, overflow: 'hidden' }, earningsCardImage: { borderRadius: 24 },
  cardOverlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.primaryDark, opacity: 0.86 },
  period: { alignItems: 'flex-start' }, total: { fontSize: 36, color: colors.earningsMint, marginTop: 10, ...moneyText, fontFamily: fonts.moneyExtraBold }, currency: { fontSize: 14, fontWeight: '500', color: '#CBD5E1' },
  balances: { flexDirection: 'row', gap: 18, marginTop: 26 }, balance: { flex: 1 }, balanceLabel: { fontSize: 12, lineHeight: 18, color: '#CBD5E1' }, balanceValue: { fontSize: 18, lineHeight: 25, color: colors.white, marginTop: 5,  ...moneyText }, smallCurrency: { fontSize: 10 }, balanceNote: { fontSize: 11, lineHeight: 17, color: colors.textSecondary, marginHorizontal: layout.screenGutter, marginTop: 12, marginBottom: 8 },
  cardActions: { flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', paddingTop: 22 }, withdrawButton: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 17, borderRadius: 24, backgroundColor: colors.white }, withdrawText: { fontFamily: fonts.semiBold, fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  sheet: { flex: 1, backgroundColor: colors.backgroundLight, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: layout.screenGutter, paddingTop: 26 }, sectionTitle: { fontFamily: fonts.semiBold, fontWeight: '600', fontSize: 20, color: colors.textPrimary }, summary: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 28 }, summaryItem: { flex: 1, paddingVertical: 8 }, summaryLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 }, muted: { fontSize: 14, lineHeight: 21, color: colors.textSecondary }, summaryAmount: { fontSize: 20, color: colors.textPrimary, marginTop: 8,  ...moneyText }, summaryCurrency: { fontSize: 12, fontWeight: '500' }, filters: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 10 }, filter: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 24, backgroundColor: colors.white, paddingHorizontal: 8 }, activeFilter: { backgroundColor: colors.primaryBrandBlue }, filterText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary }, white: { color: colors.white },
  date: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginTop: 18, marginBottom: 13 }, card: { backgroundColor: colors.white, borderRadius: 20, padding: 17, marginBottom: 14, shadowColor: colors.primaryDark, shadowOpacity: 0.06, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 3 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, transactionIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#EDF2FF', alignItems: 'center', justifyContent: 'center' }, incomingIcon: { backgroundColor: '#EAF7EF' }, transactionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary }, reference: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 5 }, cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 16 }, status: { fontSize: 12, color: colors.textSecondary, backgroundColor: colors.backgroundLight, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, ...statusText }, transactionAmount: { fontSize: 18, color: colors.textPrimary,  ...moneyText }, incomingAmount: { color: '#287E48' }, empty: { alignItems: 'center', paddingVertical: 35, gap: 12 }, emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary }, footnote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 18 },
});

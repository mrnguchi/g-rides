// Fixed reporting date keeps the prototype's periods and transactions reproducible.
export const OWNER_REPORT_DATE = '2026-10-18';
export const OWNER_TRANSACTIONS = [
  { id: 'TX-108', date: '2026-10-16', title: 'Rental payment', reference: 'Toyota Yaris · TX-108', direction: 'incoming', amount: 175000 },
  { id: 'TX-107', date: '2026-10-14', title: 'Rental payment', reference: 'Toyota 4Runner · TX-107', direction: 'incoming', amount: 150000 },
  { id: 'TX-106', date: '2026-10-14', title: 'Withdrawal', reference: 'Mobile money payout', direction: 'outgoing', amount: 250000 },
  { id: 'TX-105', date: '2026-10-08', title: 'Rental settlement', reference: 'Multiple completed bookings', direction: 'incoming', amount: 450000 },
  { id: 'TX-104', date: '2026-10-05', title: 'Withdrawal', reference: 'Mobile money payout', direction: 'outgoing', amount: 350000 },
  { id: 'TX-103', date: '2026-10-03', title: 'Rental settlement', reference: 'Multiple completed bookings', direction: 'incoming', amount: 475000 },
  { id: 'TX-102', date: '2026-09-28', title: 'Rental settlement', reference: 'September bookings', direction: 'incoming', amount: 1080000 },
  { id: 'TX-101', date: '2026-09-28', title: 'Payout settlement', reference: 'Previous withdrawals', direction: 'outgoing', amount: 7400000 },
  { id: 'TX-100', date: '2026-08-31', title: 'Rental settlement', reference: 'Earlier 2026 bookings', direction: 'incoming', amount: 6920000 },
  { id: 'TX-099', date: '2025-12-31', title: 'Rental settlement', reference: 'Previous year bookings', direction: 'incoming', amount: 5500000 },
  { id: 'TX-098', date: '2025-12-31', title: 'Payout settlement', reference: 'Previous year withdrawals', direction: 'outgoing', amount: 5500000 },
] as const;
export const MOCK_OWNER_EARNINGS = { monthly: 1250000, available: 850000, pending: 400000 };

export const OWNER_EARNINGS_PERIODS = [
  { id: 'week', label: 'This week', heading: 'Earnings this week', amount: 325000 },
  { id: 'month', label: 'This month', heading: 'Earnings this month', amount: MOCK_OWNER_EARNINGS.monthly },
  { id: 'lastMonth', label: 'Last month', heading: 'Earnings last month', amount: 1080000 },
  { id: 'year', label: 'This year', heading: 'Earnings this year', amount: 9250000 },
  { id: 'all', label: 'All time', heading: 'All-time earnings', amount: 14750000 },
] as const;
export type OwnerEarningsPeriod = typeof OWNER_EARNINGS_PERIODS[number]['id'];
export function getOwnerTransactions(period: OwnerEarningsPeriod) {
  const ranges = { week: ['2026-10-12', OWNER_REPORT_DATE], month: ['2026-10-01', OWNER_REPORT_DATE], lastMonth: ['2026-09-01', '2026-09-30'], year: ['2026-01-01', OWNER_REPORT_DATE], all: ['0000-01-01', OWNER_REPORT_DATE] };
  const [start, end] = ranges[period];
  return OWNER_TRANSACTIONS.filter(item => item.date >= start && item.date <= end);
}
export const getOwnerEarningsPeriod = (id: OwnerEarningsPeriod) => ({ ...OWNER_EARNINGS_PERIODS.find(period => period.id === id)!, amount: getOwnerTransactions(id).filter(item => item.direction === 'incoming').reduce((sum, item) => sum + item.amount, 0) });

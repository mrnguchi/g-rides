import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts, moneyText } from '../theme';
import type { Vehicle } from '../types/map';
import { AppIcon } from './AppIcon';

export function ListingCarCard({ vehicle, onPress }: {
  vehicle: Vehicle; onPress: () => void;
}) {
  const year = vehicle.model.match(/\b(19|20)\d{2}\b/)?.[0];
  const model = vehicle.model.replace(/\s*\b(19|20)\d{2}\b/, '');
  const specs = [
    ['Transmission', vehicle.transmission ?? '—'],
    ['Type', vehicle.category === 'SUVs' ? 'SUV' : vehicle.category === 'Sedans' ? 'Sedan' : vehicle.category],
    ['Seats', vehicle.seats?.toString() ?? '—'],
    ['Rating', vehicle.rating.toFixed(1)],
  ];
  return <Pressable accessibilityRole="button" accessibilityLabel={`${vehicle.brand} ${vehicle.model}, ${vehicle.pricePerDayXaf.toLocaleString('en-US')} XAF per day. Rating ${vehicle.rating.toFixed(1)}. View car details.`} onPress={onPress} style={({ pressed }) => [s.card, pressed && s.pressed]}>
    <View style={s.top}><View style={s.identity}><Text style={s.name}>{vehicle.brand} {model}</Text>{year && <Text style={s.year}>{year}</Text>}</View><View style={s.priceBlock}><Text style={s.price}>{vehicle.pricePerDayXaf.toLocaleString('en-US')} XAF</Text><Text style={s.perDay}>per day</Text></View></View>
    <Image source={vehicle.image} resizeMode="contain" style={s.image} />
    <View style={s.bottom}><View style={s.specs}>{specs.map(([label, value], index) => <View key={label} style={[s.spec, index === 0 && s.transmission, index > 0 && s.divider]}><Text numberOfLines={1} style={s.specLabel}>{label}</Text><View style={s.specValueRow}>{label === 'Rating' && <Ionicons name="star" size={12} color={colors.orange} />}<Text numberOfLines={1} style={s.specValue}>{value}</Text></View></View>)}</View><View style={s.arrow}><AppIcon name="arrowUpRight" size={24} color={colors.white} strokeWidth={1.5} /></View></View>
  </Pressable>;
}

const s = StyleSheet.create({
  card: { backgroundColor: '#F3F4F6', borderRadius: 22, marginBottom: 16, paddingTop: 18 },
  top: { paddingHorizontal: 18, flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  identity: { flex: 1 }, name: { fontFamily: fonts.semiBold, color: colors.textPrimary, fontSize: 17 },
  year: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginTop: 5 },
  priceBlock: { alignItems: 'flex-end' }, price: { color: colors.textPrimary, fontSize: 15, ...moneyText }, perDay: { fontFamily: fonts.regular, color: colors.orange, fontSize: 13, marginTop: 4 },
  image: { width: '100%', height: 172, marginVertical: 8 },
  bottom: { flexDirection: 'row', alignItems: 'flex-end' }, specs: { flex: 1, flexDirection: 'row', paddingLeft: 12, paddingBottom: 18 }, spec: { flex: 1, paddingHorizontal: 5 }, transmission: { flex: 1.8 }, divider: { borderLeftWidth: 1, borderLeftColor: colors.borderGray },
  specLabel: { fontFamily: fonts.regular, color: colors.textSecondary, fontSize: 11, marginBottom: 7 }, specValue: { fontFamily: fonts.medium, color: colors.textPrimary, fontSize: 13 },
  arrow: { width: 46, height: 52, marginLeft: 5, borderTopLeftRadius: 17, borderBottomRightRadius: 22, backgroundColor: colors.primaryBrandBlue, alignItems: 'center', justifyContent: 'center' },
  specValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 }, pressed: { opacity: 0.75 },
});

import { Platform } from 'react-native';

const androidFontFamily = 'Roboto';

export const fonts = {
  money: 'Roboto_600SemiBold',
  moneyExtraBold: 'Roboto_800ExtraBold',
  regular: Platform.select({
    ios: 'Inter_400Regular',
    android: androidFontFamily,
  }),
  medium: Platform.select({
    ios: 'Inter_500Medium',
    android: androidFontFamily,
  }),
  semiBold: Platform.select({
    ios: 'Inter_600SemiBold',
    android: androidFontFamily,
  }),
  bold: Platform.select({
    ios: 'Inter_700Bold',
    android: androidFontFamily,
  }),
} as const;

// Use the bundled face directly, without a synthetic platform weight.
export const moneyText = { fontFamily: fonts.money, fontWeight: 'normal' as const };

// Process states use regular weight on both iOS and Android.
export const statusText = { fontFamily: fonts.regular, fontWeight: '400' as const };

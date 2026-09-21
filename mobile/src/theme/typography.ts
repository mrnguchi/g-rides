import { Platform } from 'react-native';

const androidFontFamily = 'Roboto';

export const fonts = {
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

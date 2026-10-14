export const colors = {
  white: '#FFFFFF',
  primaryBrandBlue: '#355cdb',
  primaryDark: '#0F172A',
  backgroundLight: '#F8FAFC',
  surfaceGray: '#EEF2F7',
  borderGray: '#DCE3EC',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#2F9A56',
  earningsMint: '#7DDDB5',
  warning: '#F59E0B',
  error: '#EF4444',
  luxuryAccent: '#C8A96B',
  trackingGlow: '#93C5FD',
  orange: '#f38f48',
} as const;

export type ColorName = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorName];

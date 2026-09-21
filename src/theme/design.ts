export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  sheet: 28,
  pill: 999,
} as const;

export const iconSizes = {
  compact: 16,
  inline: 18,
  control: 21,
  navigation: 24,
  feature: 28,
} as const;

export const controlHeights = {
  compact: 40,
  standard: 48,
  primary: 54,
} as const;

export const surfaces = {
  canvas: '#F5F6F8',
  raised: '#FFFFFF',
  muted: '#F0F2F5',
  blueSoft: '#EDF4FF',
  greenSoft: '#EAF7EF',
  redSoft: '#FFF0F1',
  navySoft: '#182136',
} as const;

export const shadows = {
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 3,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 9,
  },
} as const;


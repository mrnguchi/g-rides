import type { TowRequest, TowingProvider } from '../types/towing';

export const MOCK_TOWING_PROVIDERS: readonly TowingProvider[] = [
  {
    available: true,
    id: 'provider-buea-roadside',
    name: 'Buea Roadside Partner',
    rating: 4.8,
    serviceAreas: ['Buea'],
    services: ['towing'],
    vehicleTypes: ['flatbed', 'wheel-lift'],
    verified: true,
  },
];

export const MOCK_TOW_REQUESTS: readonly TowRequest[] = [];


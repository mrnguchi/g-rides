import type {
  MaintenanceProvider,
  MaintenanceRequest,
} from '../types/maintenance';

export const MOCK_MAINTENANCE_PROVIDERS: readonly MaintenanceProvider[] = [
  {
    fulfillment: ['garage', 'mobile'],
    id: 'provider-g-rides-auto-care',
    maintenanceServices: [
      'oil_and_filter_change',
      'diagnostics',
      'inspection',
      'battery_service',
    ],
    name: 'G-Rides Auto Care Partner',
    rating: 4.7,
    serviceAreas: ['Buea', 'Douala'],
    services: ['maintenance'],
    verified: true,
  },
];

export const MOCK_MAINTENANCE_REQUESTS: readonly MaintenanceRequest[] = [];


import type { ServiceDefinition } from '../types/service';

const allRoles = ['renter', 'owner', 'driver'] as const;

export const MOCK_SERVICE_CATALOG: readonly ServiceDefinition[] = [
  {
    availability: 'available',
    description: 'Find trusted vehicles nearby and book with confidence.',
    discoverable: true,
    iconKey: 'car',
    id: 'rental',
    requiresVehicle: false,
    shortLabel: 'Rent a car',
    supportedRoles: allRoles,
    title: 'Vehicle rentals',
  },
  {
    availability: 'coming_soon',
    description: 'Book oil changes, inspections, and vehicle maintenance.',
    discoverable: true,
    iconKey: 'maintenance',
    id: 'maintenance',
    requiresVehicle: true,
    shortLabel: 'Maintenance',
    supportedRoles: allRoles,
    title: 'Vehicle maintenance',
  },
  {
    availability: 'coming_soon',
    description: 'Find compatible spare parts from trusted local vendors.',
    discoverable: true,
    iconKey: 'parts',
    id: 'parts',
    requiresVehicle: true,
    shortLabel: 'Spare parts',
    supportedRoles: allRoles,
    title: 'Motor spare parts',
  },
  {
    availability: 'coming_soon',
    description: 'Request roadside help and track the assigned tow vehicle.',
    discoverable: true,
    iconKey: 'towing',
    id: 'towing',
    requiresVehicle: true,
    shortLabel: 'Towing',
    supportedRoles: allRoles,
    title: 'Towing and roadside assistance',
    urgent: true,
  },
  {
    availability: 'coming_soon',
    description: 'Compare coverage from approved insurance partners.',
    discoverable: true,
    iconKey: 'insurance',
    id: 'insurance',
    requiresVehicle: true,
    shortLabel: 'Insurance',
    supportedRoles: allRoles,
    title: 'Vehicle insurance',
  },
];


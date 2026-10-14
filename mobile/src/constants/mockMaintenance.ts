import type {
  MaintenanceProvider,
  MaintenanceRequest,
} from '../types/maintenance';

export const MOCK_MAINTENANCE_PROVIDERS: readonly MaintenanceProvider[] = [
  // UI examples using supplied promotional assets. Areas/services are demo data,
  // not verified business listings or evidence of a G-Rides partnership.
  { id: 'demo-ifix-automotive', name: 'I-Fix It Automotive',
    flyer: require('../../assets/images/garages/garage 1.jpg'),
    areaLabel: 'Bonapriso, Douala', serviceAreas: ['Douala'],
    description: 'Vehicle diagnostics, routine care and inspections. Describe your concern so the garage can recommend the next step.',
    maintenanceServices: ['diagnostics', 'inspection', 'oil_and_filter_change'],
    fulfillment: ['garage'], services: ['maintenance'], verified: false },
  { id: 'demo-auto-hut', name: 'Auto Hut',
    flyer: require('../../assets/images/garages/garage 2.jpg'),
    areaLabel: 'Molyko, Buea', serviceAreas: ['Buea'],
    description: 'Inspection and diagnostic services to help identify what your vehicle needs before work begins.',
    maintenanceServices: ['inspection', 'diagnostics', 'battery_service'],
    fulfillment: ['garage'], services: ['maintenance'], verified: false },
  { id: 'demo-autorelli', name: 'Autorelli Auto Care',
    flyer: require('../../assets/images/garages/garage 3.jpg'),
    areaLabel: 'Mile 4, Limbe', serviceAreas: ['Limbe'],
    description: 'Routine servicing, tyre care and battery checks to keep your vehicle ready for the road.',
    maintenanceServices: ['oil_and_filter_change', 'tyre_service', 'battery_service'],
    fulfillment: ['garage'], services: ['maintenance'], verified: false },
];

export const MOCK_MAINTENANCE_REQUESTS: readonly MaintenanceRequest[] = [];


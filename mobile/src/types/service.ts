import type { UserRole } from './user';

export type ServiceVertical =
  | 'insurance'
  | 'maintenance'
  | 'parts'
  | 'rental'
  | 'towing';

export type ServiceAvailability =
  | 'available'
  | 'coming_soon'
  | 'unavailable_in_area';

export type ServiceIconKey =
  | 'car'
  | 'insurance'
  | 'maintenance'
  | 'parts'
  | 'towing';

export type ServiceDefinition = {
  availability: ServiceAvailability;
  description: string;
  discoverable: boolean;
  id: ServiceVertical;
  iconKey: ServiceIconKey;
  requiresVehicle: boolean;
  shortLabel: string;
  supportedRoles: readonly UserRole[];
  title: string;
  urgent?: boolean;
};

export type ServiceAction =
  | 'browse_rentals'
  | 'buy_fleet_parts'
  | 'buy_parts'
  | 'dispatch_fleet_tow'
  | 'list_and_manage_rentals'
  | 'manage_fleet_insurance'
  | 'manage_fleet_maintenance'
  | 'provide_chauffeur_service'
  | 'request_assigned_vehicle_maintenance'
  | 'request_assigned_vehicle_parts'
  | 'request_assigned_vehicle_tow'
  | 'request_insurance_quote'
  | 'request_maintenance'
  | 'request_tow'
  | 'view_assigned_vehicle_insurance';


import type { ServiceProvider } from './provider';
import type { ImageSourcePropType } from 'react-native';

export type MaintenanceServiceType =
  | 'battery_service'
  | 'diagnostics'
  | 'inspection'
  | 'oil_and_filter_change'
  | 'tyre_service';

export type MaintenanceFulfillment = 'garage' | 'mobile';

export type MaintenanceRequestStatus =
  | 'canceled'
  | 'completed'
  | 'confirmed'
  | 'in_progress'
  | 'quoted'
  | 'requested';

export type MaintenanceProvider = ServiceProvider & {
  flyer?: ImageSourcePropType;
  areaLabel?: string;
  description?: string;
  fulfillment: readonly MaintenanceFulfillment[];
  maintenanceServices: readonly MaintenanceServiceType[];
};

export type MaintenanceRequest = {
  createdAt: string;
  fulfillment: MaintenanceFulfillment;
  id: string;
  providerId?: string;
  quoteXaf?: number;
  scheduledAt?: string;
  serviceTypes: readonly MaintenanceServiceType[];
  status: MaintenanceRequestStatus;
  userVehicleId: string;
};


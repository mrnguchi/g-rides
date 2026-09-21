import type { Coordinate } from './location';
import type { ServiceProvider } from './provider';

export type TowIssueType =
  | 'accident'
  | 'breakdown'
  | 'flat_tyre'
  | 'stuck_vehicle'
  | 'vehicle_transport'
  | 'other';

export type TowRequestStatus =
  | 'arrived'
  | 'assigned'
  | 'canceled'
  | 'completed'
  | 'en_route'
  | 'matching'
  | 'payment_pending'
  | 'requested';

export type TowingProvider = ServiceProvider & {
  available: boolean;
  vehicleTypes: readonly string[];
};

export type TowRequest = {
  assignedProviderId?: string;
  createdAt: string;
  destination?: Coordinate;
  estimatedArrivalMinutes?: number;
  estimatedPriceXaf?: number;
  id: string;
  issue: TowIssueType;
  pickup: Coordinate;
  status: TowRequestStatus;
  userVehicleId: string;
};

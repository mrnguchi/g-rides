import type { ImageSourcePropType } from 'react-native';

import type { Coordinate } from './location';

export type FuelType =
  | 'diesel'
  | 'electric'
  | 'hybrid'
  | 'petrol'
  | 'unknown';

export type TransmissionType = 'automatic' | 'manual' | 'unknown';

export type UserVehicleRelationship =
  | 'active_rental'
  | 'assigned'
  | 'fleet'
  | 'personal';

export type UserVehicleStatus = 'active' | 'archived' | 'pending_verification';

export type VehicleDocumentKind =
  | 'insurance'
  | 'registration'
  | 'roadworthiness'
  | 'other';

export type VehicleDocumentStatus = 'expired' | 'pending' | 'verified';

export type VehicleDocument = {
  expiresAt?: string;
  id: string;
  kind: VehicleDocumentKind;
  name: string;
  status: VehicleDocumentStatus;
};

/**
 * A vehicle attached to a user's Garage. This is intentionally separate from
 * the rental-marketplace Vehicle type while the existing rental UI is being
 * migrated. Every new service vertical should reference this model.
 */
export type UserVehicle = {
  assignedUserId?: string;
  category: string;
  documents: readonly VehicleDocument[];
  fuelType: FuelType;
  id: string;
  image?: ImageSourcePropType;
  lastKnownLocation?: Coordinate;
  make: string;
  mileageKm?: number;
  model: string;
  ownerUserId: string;
  registrationNumber: string;
  relationship: UserVehicleRelationship;
  status: UserVehicleStatus;
  transmission: TransmissionType;
  vin?: string;
  year: number;
};

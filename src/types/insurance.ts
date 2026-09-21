import type { ServiceProvider } from './provider';

export type InsuranceCoverage =
  | 'comprehensive'
  | 'third_party'
  | 'third_party_fire_and_theft';

export type InsuranceApplicationStatus =
  | 'approved'
  | 'documents_required'
  | 'expired'
  | 'pending'
  | 'rejected';

export type InsurancePartner = ServiceProvider & {
  coverageOptions: readonly InsuranceCoverage[];
};

export type InsuranceQuote = {
  annualPremiumXaf: number;
  coverage: InsuranceCoverage;
  expiresAt: string;
  id: string;
  partnerId: string;
  status: InsuranceApplicationStatus;
  userVehicleId: string;
};

export type InsurancePolicy = {
  coverage: InsuranceCoverage;
  endsAt: string;
  id: string;
  partnerId: string;
  policyNumber: string;
  startsAt: string;
  userVehicleId: string;
};


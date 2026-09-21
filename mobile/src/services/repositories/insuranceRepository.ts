import {
  MOCK_INSURANCE_PARTNERS,
  MOCK_INSURANCE_POLICIES,
  MOCK_INSURANCE_QUOTES,
} from '../../constants/mockInsurance';
import type {
  InsurancePartner,
  InsurancePolicy,
  InsuranceQuote,
} from '../../types/insurance';

export type InsuranceRepository = {
  listPartners: () => Promise<readonly InsurancePartner[]>;
  listPolicies: (userVehicleId?: string) => Promise<readonly InsurancePolicy[]>;
  listQuotes: (userVehicleId?: string) => Promise<readonly InsuranceQuote[]>;
};

export const mockInsuranceRepository: InsuranceRepository = {
  async listPartners() {
    return MOCK_INSURANCE_PARTNERS;
  },

  async listPolicies(userVehicleId) {
    if (!userVehicleId) return MOCK_INSURANCE_POLICIES;
    return MOCK_INSURANCE_POLICIES.filter(
      (policy) => policy.userVehicleId === userVehicleId,
    );
  },

  async listQuotes(userVehicleId) {
    if (!userVehicleId) return MOCK_INSURANCE_QUOTES;
    return MOCK_INSURANCE_QUOTES.filter(
      (quote) => quote.userVehicleId === userVehicleId,
    );
  },
};


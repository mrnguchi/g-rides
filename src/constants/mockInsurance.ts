import type {
  InsurancePartner,
  InsurancePolicy,
  InsuranceQuote,
} from '../types/insurance';

export const MOCK_INSURANCE_PARTNERS: readonly InsurancePartner[] = [
  {
    coverageOptions: [
      'third_party',
      'third_party_fire_and_theft',
      'comprehensive',
    ],
    id: 'partner-insurance-demo',
    name: 'Approved Insurance Partner',
    serviceAreas: ['Cameroon'],
    services: ['insurance'],
    verified: true,
  },
];

export const MOCK_INSURANCE_QUOTES: readonly InsuranceQuote[] = [];
export const MOCK_INSURANCE_POLICIES: readonly InsurancePolicy[] = [];


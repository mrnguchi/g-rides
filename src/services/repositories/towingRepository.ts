import {
  MOCK_TOW_REQUESTS,
  MOCK_TOWING_PROVIDERS,
} from '../../constants/mockTowing';
import type { TowRequest, TowingProvider } from '../../types/towing';

export type TowingRepository = {
  getRequestById: (id: string) => Promise<TowRequest | undefined>;
  listAvailableProviders: (serviceArea?: string) => Promise<readonly TowingProvider[]>;
  listRequests: () => Promise<readonly TowRequest[]>;
};

export const mockTowingRepository: TowingRepository = {
  async getRequestById(id) {
    return MOCK_TOW_REQUESTS.find((request) => request.id === id);
  },

  async listAvailableProviders(serviceArea) {
    return MOCK_TOWING_PROVIDERS.filter(
      (provider) =>
        provider.available &&
        (!serviceArea ||
          provider.serviceAreas.some(
            (area) => area.toLowerCase() === serviceArea.toLowerCase(),
          )),
    );
  },

  async listRequests() {
    return MOCK_TOW_REQUESTS;
  },
};


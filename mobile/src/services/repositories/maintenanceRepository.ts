import {
  MOCK_MAINTENANCE_PROVIDERS,
  MOCK_MAINTENANCE_REQUESTS,
} from '../../constants/mockMaintenance';
import type {
  MaintenanceProvider,
  MaintenanceRequest,
} from '../../types/maintenance';

export type MaintenanceRepository = {
  listProviders: (serviceArea?: string) => Promise<readonly MaintenanceProvider[]>;
  listRequests: (userVehicleId?: string) => Promise<readonly MaintenanceRequest[]>;
};

export const mockMaintenanceRepository: MaintenanceRepository = {
  async listProviders(serviceArea) {
    if (!serviceArea) return MOCK_MAINTENANCE_PROVIDERS;
    return MOCK_MAINTENANCE_PROVIDERS.filter((provider) =>
      provider.serviceAreas.some(
        (area) => area.toLowerCase() === serviceArea.toLowerCase(),
      ),
    );
  },

  async listRequests(userVehicleId) {
    if (!userVehicleId) return MOCK_MAINTENANCE_REQUESTS;
    return MOCK_MAINTENANCE_REQUESTS.filter(
      (request) => request.userVehicleId === userVehicleId,
    );
  },
};


import { MOCK_SERVICE_CATALOG } from '../../constants/mockServices';
import type {
  ServiceDefinition,
  ServiceVertical,
} from '../../types/service';
import type { UserRole } from '../../types/user';

export type ServiceCatalogRepository = {
  getById: (id: ServiceVertical) => Promise<ServiceDefinition | undefined>;
  listForRole: (role: UserRole) => Promise<readonly ServiceDefinition[]>;
};

export const mockServiceCatalogRepository: ServiceCatalogRepository = {
  async getById(id) {
    return MOCK_SERVICE_CATALOG.find((service) => service.id === id);
  },

  async listForRole(role) {
    return MOCK_SERVICE_CATALOG.filter((service) =>
      service.supportedRoles.includes(role),
    );
  },
};


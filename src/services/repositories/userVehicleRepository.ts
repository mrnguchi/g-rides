import { MOCK_USER_VEHICLES } from '../../constants/mockUserVehicles';
import type { UserRole } from '../../types/user';
import type { UserVehicle } from '../../types/vehicle';

export type UserVehicleRepository = {
  getById: (id: string) => Promise<UserVehicle | undefined>;
  listForUser: (
    userId: string,
    activeRole: UserRole,
  ) => Promise<readonly UserVehicle[]>;
};

export const mockUserVehicleRepository: UserVehicleRepository = {
  async getById(id) {
    return MOCK_USER_VEHICLES.find((vehicle) => vehicle.id === id);
  },

  async listForUser(userId, activeRole) {
    return MOCK_USER_VEHICLES.filter((vehicle) => {
      if (activeRole === 'driver') return vehicle.assignedUserId === userId;
      if (activeRole === 'owner') return vehicle.ownerUserId === userId;

      return (
        vehicle.ownerUserId === userId && vehicle.relationship === 'personal'
      );
    });
  },
};


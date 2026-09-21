import {
  MOCK_ACTIVE_RENTAL,
  MOCK_RENTAL_HISTORY,
  MOCK_UPCOMING_RENTALS,
} from '../../constants/mockRentals';
import type { RentalRecord, RentalStatus } from '../../types/rental';

export type RentalRepository = {
  getById: (id: string) => Promise<RentalRecord | undefined>;
  list: (status?: RentalStatus) => Promise<readonly RentalRecord[]>;
};

const allMockRentals = [
  MOCK_ACTIVE_RENTAL,
  ...MOCK_UPCOMING_RENTALS,
  ...MOCK_RENTAL_HISTORY,
];

export const mockRentalRepository: RentalRepository = {
  async getById(id) {
    return allMockRentals.find((rental) => rental.id === id);
  },

  async list(status) {
    return status
      ? allMockRentals.filter((rental) => rental.status === status)
      : allMockRentals;
  },
};


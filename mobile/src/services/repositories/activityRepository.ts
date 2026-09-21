import { MOCK_SERVICE_ACTIVITIES } from '../../constants/mockServiceActivities';
import type { ServiceActivity } from '../../types/activity';
import type { ServiceVertical } from '../../types/service';
import type { UserRole } from '../../types/user';

export type ActivityQuery = {
  role: UserRole;
  service?: ServiceVertical;
};

export type ActivityRepository = {
  getById: (id: string) => Promise<ServiceActivity | undefined>;
  list: (query: ActivityQuery) => Promise<readonly ServiceActivity[]>;
};

export const mockActivityRepository: ActivityRepository = {
  async getById(id) {
    return MOCK_SERVICE_ACTIVITIES.find((activity) => activity.id === id);
  },

  async list({ role, service }) {
    return MOCK_SERVICE_ACTIVITIES.filter(
      (activity) =>
        activity.role === role && (!service || activity.service === service),
    ).sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    );
  },
};


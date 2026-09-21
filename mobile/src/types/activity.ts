import type { ServiceVertical } from './service';
import type { UserRole } from './user';

export type ServiceActivityStatus =
  | 'action_required'
  | 'canceled'
  | 'completed'
  | 'confirmed'
  | 'failed'
  | 'in_progress'
  | 'pending';

export type ServiceActivity = {
  createdAt: string;
  id: string;
  reference: string;
  role: UserRole;
  service: ServiceVertical;
  status: ServiceActivityStatus;
  subtitle?: string;
  title: string;
  updatedAt: string;
  userVehicleId?: string;
};


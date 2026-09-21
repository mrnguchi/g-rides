import type { ServiceAction, ServiceVertical } from '../types/service';
import type { UserRole } from '../types/user';

export const SERVICE_ACTIONS_BY_ROLE: Record<
  UserRole,
  Record<ServiceVertical, readonly ServiceAction[]>
> = {
  renter: {
    rental: ['browse_rentals'],
    maintenance: ['request_maintenance'],
    parts: ['buy_parts'],
    towing: ['request_tow'],
    insurance: ['request_insurance_quote'],
  },
  owner: {
    rental: ['list_and_manage_rentals'],
    maintenance: ['manage_fleet_maintenance'],
    parts: ['buy_fleet_parts'],
    towing: ['dispatch_fleet_tow'],
    insurance: ['manage_fleet_insurance'],
  },
  driver: {
    rental: ['provide_chauffeur_service'],
    maintenance: ['request_assigned_vehicle_maintenance'],
    parts: ['request_assigned_vehicle_parts'],
    towing: ['request_assigned_vehicle_tow'],
    insurance: ['view_assigned_vehicle_insurance'],
  },
};

export function getServiceActionsForRole(
  role: UserRole,
  service: ServiceVertical,
) {
  return SERVICE_ACTIONS_BY_ROLE[role][service];
}

export function canPerformServiceAction(
  role: UserRole,
  service: ServiceVertical,
  action: ServiceAction,
) {
  return getServiceActionsForRole(role, service).includes(action);
}


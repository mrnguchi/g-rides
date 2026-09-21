import type { ServiceActivity } from '../types/activity';

export const MOCK_SERVICE_ACTIVITIES: readonly ServiceActivity[] = [
  {
    createdAt: '2026-08-07T09:00:00+01:00',
    id: 'activity-rental-active-toyota',
    reference: 'LTGR13',
    role: 'renter',
    service: 'rental',
    status: 'in_progress',
    subtitle: 'Toyota Vanguard 2010',
    title: 'Rental in progress',
    updatedAt: '2026-08-15T09:30:00+01:00',
  },
  {
    createdAt: '2026-07-18T10:00:00+01:00',
    id: 'activity-rental-completed-mercedes',
    reference: 'MBGL52',
    role: 'renter',
    service: 'rental',
    status: 'completed',
    subtitle: 'Mercedes-Benz GLE 350',
    title: 'Rental completed',
    updatedAt: '2026-07-21T10:00:00+01:00',
  },
];


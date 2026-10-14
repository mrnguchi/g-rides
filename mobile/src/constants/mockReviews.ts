import { MOCK_HOME_VEHICLES } from './mockVehicles';
import type { VehicleReview } from '../types/review';

// Fictional reviews for the frontend preview, scoped to each vehicle.
export const MOCK_VEHICLE_REVIEWS: VehicleReview[] = MOCK_HOME_VEHICLES.flatMap((vehicle) => [
  {
    id: `${vehicle.id}-review-1`, vehicleId: vehicle.id, author: 'Alex M.', rating: 5,
    comment: 'The car was clean and comfortable. Pickup was straightforward, and the owner explained everything before we left.',
    createdAt: '2026-09-14T10:00:00Z',
  },
  {
    id: `${vehicle.id}-review-2`, vehicleId: vehicle.id, author: 'Danielle N.', rating: 4,
    comment: 'A good car for our weekend trip. Communication was helpful, though the handover took a little longer than expected.',
    createdAt: '2026-09-06T10:00:00Z',
  },
]);

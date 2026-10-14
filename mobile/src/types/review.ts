export type VehicleReview = {
  id: string;
  vehicleId: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
  isOwn?: boolean;
};

export type ReviewInput = Pick<VehicleReview, 'rating' | 'comment'>;

import type { Coordinate } from './location';
import type { ServiceVertical } from './service';

export type ServiceProvider = {
  id: string;
  location?: Coordinate;
  name: string;
  rating?: number;
  serviceAreas: readonly string[];
  services: readonly ServiceVertical[];
  verified: boolean;
};

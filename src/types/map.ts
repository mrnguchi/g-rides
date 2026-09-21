import type { ImageSourcePropType } from 'react-native';

import type { Coordinate } from './location';

export type { Coordinate } from './location';

export type VehicleCategory = 'Luxury' | 'SUVs' | 'Sedans';

export type VehicleCategoryFilter = 'All Cars' | VehicleCategory;

export type Vehicle = {
  available: boolean;
  brand: string;
  category: VehicleCategory;
  coordinate: Coordinate;
  distanceKm: number;
  id: string;
  image: ImageSourcePropType;
  markerImage: ImageSourcePropType;
  model: string;
  pricePerDayXaf: number;
  rating: number;
};

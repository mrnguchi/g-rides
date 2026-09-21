import type { Coordinate, Vehicle } from '../types/map';

export const BONASSAMA_COORDINATE: Coordinate = {
  latitude: 4.0895,
  longitude: 9.6755,
};

export const MOCK_NEARBY_VEHICLES: Vehicle[] = [
  {
    id: 'toyota-land-cruiser-black',
    brand: 'Toyota',
    model: 'Vanguard 2010',
    category: 'SUVs',
    coordinate: {
      latitude: 4.0912,
      longitude: 9.6738,
    },
    distanceKm: 1.2,
    pricePerDayXaf: 35000,
    rating: 4.8,
    available: true,
    image: require('../../assets/images/10006.jpeg'),
    markerImage: require('../../assets/images/map-car-2.png'),
  },
  {
    id: 'range-rover-sport',
    brand: 'Range Rover',
    model: 'Range Rover Sport',
    category: 'Luxury',
    coordinate: {
      latitude: 4.0906,
      longitude: 9.6776,
    },
    distanceKm: 2.1,
    pricePerDayXaf: 55000,
    rating: 4.8,
    available: true,
    image: require('../../assets/images/car-5.jpeg'),
    markerImage: require('../../assets/images/map-car-5.png'),
  },
  {
    id: 'mercedes-gle-350',
    brand: 'Mercedes-Benz',
    model: 'Mercedes-Benz GLE 350',
    category: 'Luxury',
    coordinate: {
      latitude: 4.0877,
      longitude: 9.6737,
    },
    distanceKm: 1.8,
    pricePerDayXaf: 75000,
    rating: 4.8,
    available: true,
    image: require('../../assets/images/car-4.jpeg'),
    markerImage: require('../../assets/images/map-car-4.png'),
  },
  {
    id: 'toyota-land-cruiser-night',
    brand: 'Toyota',
    model: 'Land Cruiser 2010',
    category: 'SUVs',
    coordinate: {
      latitude: 4.0879,
      longitude: 9.678,
    },
    distanceKm: 0.8,
    pricePerDayXaf: 35000,
    rating: 4.8,
    available: true,
    image: require('../../assets/images/car-2.jpeg'),
    markerImage: require('../../assets/images/map-car-1.png'),
  },
];

const recommendedVehicleIds = [
  'range-rover-sport',
  'mercedes-gle-350',
  'toyota-land-cruiser-night',
];

export const MOCK_RECOMMENDED_VEHICLES = recommendedVehicleIds.flatMap(
  (vehicleId) => {
    const vehicle = MOCK_NEARBY_VEHICLES.find(({ id }) => id === vehicleId);
    return vehicle ? [vehicle] : [];
  },
);

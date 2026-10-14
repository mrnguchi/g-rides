import type { Coordinate, Vehicle } from '../types/map';

export const BONASSAMA_COORDINATE: Coordinate = {
  latitude: 4.0895,
  longitude: 9.6755,
};

export const MOCK_NEARBY_VEHICLES: Vehicle[] = [
  {
    id: 'toyota-yaris-2010',
    rentalTerms: { depositXaf: 25000, pickupLocation: 'Bonaberi, Douala', deliveryFeeXaf: 2000, chauffeurFeePerDayXaf: 15000 },
    transmission: 'Automatic',
    seats: 5,
    brand: 'Toyota',
    model: 'Yaris 2010',
    category: 'Sedans',
    coordinate: { latitude: 4.0899, longitude: 9.6761 },
    distanceKm: 0.7,
    pricePerDayXaf: 25000,
    rating: 4.7,
    available: true,
    image: require('../../assets/images/cars/toyota/Yaris/yaris 2010.png'),
    markerImage: require('../../assets/images/map-car-2.png'),
  },
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

// Customer Home only displays models with supplied assets in the cars folder.
// Keep this separate from legacy discovery/rental mock records until those
// screens are migrated to the new image catalogue.
export const MOCK_HOME_VEHICLES: Vehicle[] = [
  MOCK_NEARBY_VEHICLES[0],
  {
    ...MOCK_NEARBY_VEHICLES[0],
    id: 'toyota-yaris-2012',
    model: 'Yaris 2012',
    image: require('../../assets/images/cars/toyota/Yaris/yaris 2012.png'),
    pricePerDayXaf: 27000,
  },
  {
    ...MOCK_NEARBY_VEHICLES[0],
    id: 'toyota-yaris-2013',
    model: 'Yaris 2013',
    image: require('../../assets/images/cars/toyota/Yaris/yaris 2013.png'),
    pricePerDayXaf: 28000,
  },
  {
    ...MOCK_NEARBY_VEHICLES[0],
    id: 'toyota-4runner',
    rentalTerms: { depositXaf: 40000, pickupLocation: 'Bonapriso, Douala', deliveryFeeXaf: 3500, chauffeurFeePerDayXaf: 20000 },
    seats: 7,
    model: '4Runner',
    category: 'SUVs',
    image: require('../../assets/images/cars/toyota/4runner/toyota 4runner.png'),
    pricePerDayXaf: 45000,
  },
];

import type { PartProduct, PartsOrder, PartsVendor } from '../types/parts';

export const MOCK_PARTS_VENDORS: readonly PartsVendor[] = [
  {
    categories: ['filters', 'fluids', 'battery', 'brakes'],
    id: 'vendor-g-rides-parts-partner',
    name: 'G-Rides Parts Partner',
    rating: 4.6,
    serviceAreas: ['Buea', 'Douala'],
    services: ['parts'],
    verified: true,
  },
];

export const MOCK_PART_PRODUCTS: readonly PartProduct[] = [
  {
    category: 'filters',
    compatibility: [{ make: 'Toyota' }],
    id: 'part-toyota-oil-filter',
    inStock: true,
    name: 'Toyota-compatible oil filter',
    priceXaf: 8500,
    sku: 'GR-FLT-TOY-001',
    vendorId: 'vendor-g-rides-parts-partner',
  },
  {
    category: 'fluids',
    compatibility: [{ make: 'Toyota' }, { make: 'Mercedes-Benz' }],
    id: 'part-engine-oil-5l',
    inStock: true,
    name: 'Fully synthetic engine oil — 5 L',
    priceXaf: 32000,
    sku: 'GR-OIL-SYN-5L',
    vendorId: 'vendor-g-rides-parts-partner',
  },
];

export const MOCK_PARTS_ORDERS: readonly PartsOrder[] = [];


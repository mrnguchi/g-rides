import {
  MOCK_PART_PRODUCTS,
  MOCK_PARTS_ORDERS,
  MOCK_PARTS_VENDORS,
} from '../../constants/mockParts';
import type {
  PartCategory,
  PartProduct,
  PartsOrder,
  PartsVendor,
} from '../../types/parts';

export type PartProductQuery = {
  category?: PartCategory;
  search?: string;
};

export type PartsRepository = {
  listOrders: () => Promise<readonly PartsOrder[]>;
  listProducts: (query?: PartProductQuery) => Promise<readonly PartProduct[]>;
  listVendors: () => Promise<readonly PartsVendor[]>;
};

export const mockPartsRepository: PartsRepository = {
  async listOrders() {
    return MOCK_PARTS_ORDERS;
  },

  async listProducts(query = {}) {
    const normalizedSearch = query.search?.trim().toLowerCase();

    return MOCK_PART_PRODUCTS.filter(
      (product) =>
        (!query.category || product.category === query.category) &&
        (!normalizedSearch ||
          `${product.name} ${product.sku}`
            .toLowerCase()
            .includes(normalizedSearch)),
    );
  },

  async listVendors() {
    return MOCK_PARTS_VENDORS;
  },
};


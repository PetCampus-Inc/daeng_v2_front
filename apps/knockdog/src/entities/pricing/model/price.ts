type ProductType = 'MEMBERSHIP' | 'MONTHLY_TICKET' | 'COUNT_TICKET';

interface ProductItem {
  name?: string;
  price: number;
  count: string;
  weightSection?: string;
}

interface ProductCategory {
  productName: string;
  products: ProductItem[];
}

interface PricingInfo {
  productType: ProductType[];
  productCategories: ProductCategory[];
  phoneNumber?: string;
  priceImages: string[];
  lastUpdatedAt: string;
}

export type { PricingInfo, ProductType, ProductCategory, ProductItem };

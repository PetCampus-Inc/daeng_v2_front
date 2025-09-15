import api from '@shared/api/ky-client';
import type { ProductType, ProductCategory } from '../model/price';

interface PricingInfoResponse {
  productType: ProductType[];
  productCategories: ProductCategory[];
  phoneNumber?: string;
  priceImages: string[];
  lastUpdatedAt: string;
}

function getPricing(id: string): Promise<PricingInfoResponse> {
  return api.get(`/api/v0/kindergarten/${id}/pricing`).json();
}

export { getPricing, type PricingInfoResponse };

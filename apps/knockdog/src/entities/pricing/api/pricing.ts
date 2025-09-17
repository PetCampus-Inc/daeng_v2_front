import { api } from '@shared/api';
import type { ProductType, ProductCategory } from '../model/price';

// @TODO API Response, 타입 정의 필요
interface PricingInfoResponse {
  productType: ProductType[];
  productCategories: ProductCategory[];
  phoneNumber?: string;
  priceImages: string[];
  lastUpdatedAt: string;
}

function getPricing(id: string): Promise<PricingInfoResponse> {
  return api.get(`kindergarten/${id}/pricing`).json();
}

export { getPricing, type PricingInfoResponse };

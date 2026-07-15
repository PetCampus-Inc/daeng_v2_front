import { api, type ApiResponse } from '@shared/api';

import type { OwnerSchoolPricingType } from '../model/types';

interface OwnerSchoolPriceImagePayload {
  s3Key: string;
  displayOrder: number;
}

interface PutOwnerSchoolPriceRequest {
  pricingTypes: OwnerSchoolPricingType[];
  priceImages: OwnerSchoolPriceImagePayload[];
}

/** `PUT` - 원장 유치원 상품 유형·가격표 저장 */
async function putOwnerSchoolPrice(request: PutOwnerSchoolPriceRequest) {
  return await api
    .put('owner/school/price', { json: request })
    .json<ApiResponse<null>>();
}

export { putOwnerSchoolPrice, type OwnerSchoolPriceImagePayload, type PutOwnerSchoolPriceRequest };

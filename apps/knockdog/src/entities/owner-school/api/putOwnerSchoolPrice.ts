import { api, type ApiResponse } from '@shared/api';

import type { OwnerSchoolPriceImage, OwnerSchoolPricingType } from '../model/types';

interface OwnerSchoolPriceImagePayload {
  s3Key: string;
  displayOrder: number;
}

interface PutOwnerSchoolPriceRequest {
  pricingTypes: OwnerSchoolPricingType[];
  priceImages: OwnerSchoolPriceImagePayload[];
}

/** PUT owner/school/price 응답 data */
interface OwnerSchoolPriceSaveData {
  schoolId: number;
  schoolProfileId: number;
  pricingTypes: OwnerSchoolPricingType[];
  priceImages: OwnerSchoolPriceImage[];
  lastUpdatedAt: string | number[] | null;
}

/** `PUT` - 원장 유치원 상품 유형·가격표 저장 */
async function putOwnerSchoolPrice(request: PutOwnerSchoolPriceRequest) {
  return await api
    .put('owner/school/price', { json: request })
    .json<ApiResponse<OwnerSchoolPriceSaveData>>();
}

export {
  putOwnerSchoolPrice,
  type OwnerSchoolPriceImagePayload,
  type OwnerSchoolPriceSaveData,
  type PutOwnerSchoolPriceRequest,
};

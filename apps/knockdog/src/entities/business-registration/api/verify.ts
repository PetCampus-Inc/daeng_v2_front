import { api, ApiError, ApiResponse } from '@shared/api';

import {
  BUSINESS_REGISTRATION_VERIFY_CODE,
  type VerifyData,
  type VerifyRequest,
} from '../model/businessRegistration';

const VERIFY_FAILURE_CODES = new Set<string>([
  BUSINESS_REGISTRATION_VERIFY_CODE.INVALID_FORMAT,
  BUSINESS_REGISTRATION_VERIFY_CODE.DUPLICATE,
  BUSINESS_REGISTRATION_VERIFY_CODE.CLOSED_OR_SUSPENDED,
  BUSINESS_REGISTRATION_VERIFY_CODE.LOOKUP_FAILED,
]);

function isVerifySuccess(response: ApiResponse<VerifyData | null>) {
  const verifyResult = response.data;

  if (verifyResult?.valid === false) {
    return false;
  }

  if (verifyResult?.valid === true || verifyResult?.code === BUSINESS_REGISTRATION_VERIFY_CODE.SUCCESS) {
    return true;
  }

  if (verifyResult?.code && VERIFY_FAILURE_CODES.has(verifyResult.code)) {
    return false;
  }

  return response.code === 'SUCCESS' || response.code === BUSINESS_REGISTRATION_VERIFY_CODE.SUCCESS;
}

/** POST - 사업자등록번호 형식·중복·국세청 상태 검증 */
const postBusinessRegistrationVerify = async (request: VerifyRequest) => {
  const response = await api
    .post('admin/business-registration/verify', { json: request })
    .json<ApiResponse<VerifyData | null>>();

  if (!isVerifySuccess(response)) {
    const verifyResult = response.data;

    throw new ApiError(
      response.status,
      verifyResult?.code ?? response.code,
      verifyResult?.message ?? response.message
    );
  }

  return response;
};

export { postBusinessRegistrationVerify };

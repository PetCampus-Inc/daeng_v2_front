import { api, ApiResponse } from '@shared/api';

import type { VerifyRequest } from '../model/businessRegistration';

/** POST - 사업자등록번호 형식·중복·국세청 상태 검증 */
const postBusinessRegistrationVerify = async (request: VerifyRequest) => {
  return api
    .post('admin/business-registration/verify', { json: request })
    .json<ApiResponse<null>>();
};

export { postBusinessRegistrationVerify };

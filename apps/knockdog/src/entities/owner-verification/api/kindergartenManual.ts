import { api, ApiResponse } from '@shared/api';

import type { KindergartenVerificationData, ManualRequest } from '../model/ownerVerification';

/** POST - 원장 인증 유치원 직접 등록 */
const postKindergartenManual = async (request: ManualRequest) => {
  return api
    .post('admin/owner-verification/kindergarten/manual', { json: request })
    .json<ApiResponse<KindergartenVerificationData>>();
};

export { postKindergartenManual };

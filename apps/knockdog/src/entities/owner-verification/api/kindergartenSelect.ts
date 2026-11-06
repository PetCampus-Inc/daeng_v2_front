import { api, ApiResponse } from '@shared/api';

import type { KindergartenVerificationData, SelectRequest } from '../model/ownerVerification';

/** POST - 원장 인증 유치원 선택 (검색 결과) */
const postKindergartenSelect = async (request: SelectRequest) => {
  return api
    .post('admin/owner-verification/kindergarten/select', { json: request })
    .json<ApiResponse<KindergartenVerificationData>>();
};

export { postKindergartenSelect };

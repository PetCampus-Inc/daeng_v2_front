import { api, ApiResponse } from '@shared/api';

import type { SubmitRequest } from '../model/ownerVerification';

/** POST - 최종 원장 인증 신청 */
const postOwnerVerificationSubmit = async (request: SubmitRequest) => {
  return api.post('admin/owner-verification/submit', { json: request }).json<ApiResponse<null>>();
};

export { postOwnerVerificationSubmit };

import type { GuardianApplicationsDataDto } from '../model/guardianApplication';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 보호자 유치원 연결 신청 내역 조회 */
function getGuardianApplications() {
  return api.get('guardian/applications').json<ApiResponse<GuardianApplicationsDataDto>>();
}

/** `POST` - 보호자 유치원 연결 신청 취소 */
function postCancelGuardianApplication(membershipId: string) {
  return api
    .post(`guardian/applications/${membershipId}/cancel`)
    .json<ApiResponse<Record<string, never>>>();
}

export { getGuardianApplications, postCancelGuardianApplication };

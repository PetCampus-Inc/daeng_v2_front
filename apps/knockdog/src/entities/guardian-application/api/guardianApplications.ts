import type { GuardianApplicationsDataDto } from '../model/guardianApplication';

import { api, type ApiResponse } from '@shared/api';

/** `GET` - 보호자 유치원 연결 신청 내역 조회 */
function getGuardianApplications() {
  return api.get('guardian/applications').json<ApiResponse<GuardianApplicationsDataDto>>();
}

export { getGuardianApplications };

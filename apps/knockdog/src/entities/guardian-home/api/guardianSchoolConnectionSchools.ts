import type { GuardianSchoolConnectionsDto } from '../model/guardianSchoolConnection';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianSchoolConnectionSchoolsParams {
  petId: string;
}

/**
 * `GET` - 보호자 유치원 목록(학교 단위 중복 제거)
 * 바텀시트 선택용. 사이클 단위 전체 이력은 `guardian/school/connections` 사용.
 */
function getGuardianSchoolConnectionSchools({ petId }: GetGuardianSchoolConnectionSchoolsParams) {
  return api
    .get('guardian/school/connections/schools', {
      searchParams: { petId },
    })
    .json<ApiResponse<GuardianSchoolConnectionsDto>>();
}

export { getGuardianSchoolConnectionSchools };
export type { GetGuardianSchoolConnectionSchoolsParams };

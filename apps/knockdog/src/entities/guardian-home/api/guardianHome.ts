import type { GuardianHomeDto } from '../model/guardianHome';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianSchoolHomeParams {
  petId: string;
}

/** `GET` - 보호자 유치원 탭 홈 조회 */
function getGuardianSchoolHome({ petId }: GetGuardianSchoolHomeParams) {
  return api
    .get('guardian/school/home', {
      searchParams: { petId },
    })
    .json<ApiResponse<GuardianHomeDto>>();
}

export { getGuardianSchoolHome };
export type { GetGuardianSchoolHomeParams };

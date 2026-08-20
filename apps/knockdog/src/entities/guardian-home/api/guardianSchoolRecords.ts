import type { GuardianSchoolRecordsDto } from '../model/guardianSchoolRecords';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianSchoolRecordsParams {
  membershipId: string;
  yearMonth: string;
}

/** `GET` - 보호자 월별 알림장 리스트 조회 */
function getGuardianSchoolRecords({ membershipId, yearMonth }: GetGuardianSchoolRecordsParams) {
  return api
    .get('guardian/school/records', {
      searchParams: { membershipId, yearMonth },
    })
    .json<ApiResponse<GuardianSchoolRecordsDto>>();
}

export { getGuardianSchoolRecords };
export type { GetGuardianSchoolRecordsParams };

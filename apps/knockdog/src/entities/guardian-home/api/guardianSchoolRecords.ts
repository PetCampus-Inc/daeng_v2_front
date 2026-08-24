import type { GuardianSchoolRecordsDto } from '../model/guardianSchoolRecords';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianSchoolRecordsParams {
  petId: string;
  schoolId: string;
  yearMonth: string;
}

/** `GET` - 보호자 월별 알림장 리스트 조회 (pet + school 스코프) */
function getGuardianSchoolRecords({ petId, schoolId, yearMonth }: GetGuardianSchoolRecordsParams) {
  return api
    .get('guardian/school/records', {
      searchParams: { petId, schoolId, yearMonth },
    })
    .json<ApiResponse<GuardianSchoolRecordsDto>>();
}

export { getGuardianSchoolRecords };
export type { GetGuardianSchoolRecordsParams };

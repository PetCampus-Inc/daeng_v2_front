import type { GuardianCalendarDetailDto } from '../model/guardianCalendarDetail';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianCalendarDetailParams {
  petId: string;
  date: string;
  /** 생략 시 서버가 가장 최근 관계 유치원을 사용 */
  schoolId?: string;
}

/** `GET` - 보호자 유치원 탭 캘린더 날짜별 상세 조회 */
function getGuardianCalendarDetail({ petId, date, schoolId }: GetGuardianCalendarDetailParams) {
  return api
    .get('guardian/school/calendar/detail', {
      searchParams: {
        petId,
        date,
        ...(schoolId ? { schoolId } : {}),
      },
    })
    .json<ApiResponse<GuardianCalendarDetailDto>>();
}

export { getGuardianCalendarDetail };
export type { GetGuardianCalendarDetailParams };

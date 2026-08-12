import type { GuardianAlbumMonthDto } from '../model/guardianAlbumMonth';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianAlbumMonthParams {
  schoolId: string;
  yearMonth: string;
  petId: string;
}

/** `GET` - 보호자 월별 앨범 리스트 조회 */
function getGuardianAlbumMonth({ schoolId, yearMonth, petId }: GetGuardianAlbumMonthParams) {
  return api
    .get(`albums/${schoolId}/months/${yearMonth}`, {
      searchParams: { petId },
    })
    .json<ApiResponse<GuardianAlbumMonthDto>>();
}

export { getGuardianAlbumMonth };
export type { GetGuardianAlbumMonthParams };

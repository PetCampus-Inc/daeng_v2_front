import type { GuardianAlbumTodayDto } from '../model/guardianAlbumToday';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianAlbumTodayParams {
  schoolId: string;
  petId: string;
}

/** `GET` - 보호자 오늘 하루 앨범 조회 */
function getGuardianAlbumToday({ schoolId, petId }: GetGuardianAlbumTodayParams) {
  return api
    .get(`albums/${schoolId}/today`, {
      searchParams: { petId },
    })
    .json<ApiResponse<GuardianAlbumTodayDto>>();
}

export { getGuardianAlbumToday };
export type { GetGuardianAlbumTodayParams };

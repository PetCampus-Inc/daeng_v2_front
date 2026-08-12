import type { GuardianAlbumAttendedDaysDto } from '../model/guardianAlbumAttendedDays';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianAlbumAttendedDaysParams {
  schoolId: string;
  petId: string;
  cursor?: string;
  size?: number;
}

/** `GET` - 보호자 앨범 등원일만 보기 조회 */
function getGuardianAlbumAttendedDays({
  schoolId,
  petId,
  cursor,
  size = 7,
}: GetGuardianAlbumAttendedDaysParams) {
  return api
    .get(`albums/${schoolId}/attended-days`, {
      searchParams: {
        petId,
        size,
        ...(cursor ? { cursor } : {}),
      },
    })
    .json<ApiResponse<GuardianAlbumAttendedDaysDto>>();
}

export { getGuardianAlbumAttendedDays };
export type { GetGuardianAlbumAttendedDaysParams };

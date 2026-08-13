import type { GuardianAlbumPhotoDto } from '../model/guardianAlbumPhoto';

import { api, type ApiResponse } from '@shared/api';

interface GuardianAlbumDayPhotosDto {
  photos?: GuardianAlbumPhotoDto[] | null;
  nextCursor?: number | null;
  hasNext?: boolean | null;
}

interface GetGuardianAlbumDayPhotosParams {
  schoolId: string;
  /** YYYY-MM-DD */
  date: string;
  size?: number;
  cursor?: number;
}

/**
 * `GET albums/{schoolId}/photos?date=`
 * 일별 앨범 상세/프리뷰 보완용 (월·등원일 리스트 previewPhotos는 4장 고정).
 */
function getGuardianAlbumDayPhotos({
  schoolId,
  date,
  size = 30,
  cursor,
}: GetGuardianAlbumDayPhotosParams) {
  return api
    .get(`albums/${schoolId}/photos`, {
      searchParams: {
        date,
        size,
        ...(typeof cursor === 'number' ? { cursor } : {}),
      },
    })
    .json<ApiResponse<GuardianAlbumDayPhotosDto>>();
}

export { getGuardianAlbumDayPhotos };
export type { GetGuardianAlbumDayPhotosParams, GuardianAlbumDayPhotosDto };

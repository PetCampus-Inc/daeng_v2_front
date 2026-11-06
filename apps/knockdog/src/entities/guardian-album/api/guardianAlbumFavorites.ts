import type { GuardianAlbumFavoritesDto } from '../model/guardianAlbumFavorites';

import { api, type ApiResponse } from '@shared/api';

interface GetGuardianAlbumFavoritesParams {
  schoolId: string;
  petId: string;
  cursor?: string;
  size?: number;
}

/** `GET` - 보호자 앨범 즐겨찾기 조회 */
function getGuardianAlbumFavorites({
  schoolId,
  petId,
  cursor,
  size = 7,
}: GetGuardianAlbumFavoritesParams) {
  return api
    .get(`albums/${schoolId}/favorites`, {
      searchParams: {
        petId,
        size,
        ...(cursor ? { cursor } : {}),
      },
    })
    .json<ApiResponse<GuardianAlbumFavoritesDto>>();
}

export { getGuardianAlbumFavorites };
export type { GetGuardianAlbumFavoritesParams };

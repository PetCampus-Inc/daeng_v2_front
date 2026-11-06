import { api, type ApiResponse } from '@shared/api';

interface GuardianAlbumFavoriteMutationParams {
  schoolId: string;
  photoId: string;
}

/** `POST` - 보호자 앨범 사진 즐겨찾기 추가 */
function postGuardianAlbumFavorite({ schoolId, photoId }: GuardianAlbumFavoriteMutationParams) {
  return api
    .post(`albums/${schoolId}/photos/${photoId}/favorite`)
    .json<ApiResponse<void>>();
}

/** `DELETE` - 보호자 앨범 사진 즐겨찾기 해제 */
function deleteGuardianAlbumFavorite({ schoolId, photoId }: GuardianAlbumFavoriteMutationParams) {
  return api
    .delete(`albums/${schoolId}/photos/${photoId}/favorite`)
    .json<ApiResponse<void>>();
}

export { deleteGuardianAlbumFavorite, postGuardianAlbumFavorite };
export type { GuardianAlbumFavoriteMutationParams };

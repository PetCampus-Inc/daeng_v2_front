import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import type { GuardianAlbumFilterDay } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';

import { fetchGuardianAlbumDayPhotos } from '@views/guardian-album-page/model/fetchGuardianAlbumDayPhotos';

/** 즐겨찾기 필터 상세 — 해당 일의 즐겨찾기 사진만 반환 */
async function resolveGuardianAlbumFavoriteDayPhotos(
  schoolId: string,
  day: GuardianAlbumFilterDay
): Promise<GuardianAlbumPhoto[]> {
  if (day.photos.length >= day.photoCount) {
    return day.photos;
  }

  try {
    const dayPhotos = await fetchGuardianAlbumDayPhotos(schoolId, day.dateKey);
    const favoritePhotos = dayPhotos.filter((photo) => photo.isBookmarked);
    if (favoritePhotos.length > 0) return favoritePhotos;
  } catch {
    // favorites list preview로 폴백
  }

  return day.photos;
}

export { resolveGuardianAlbumFavoriteDayPhotos };

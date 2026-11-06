import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import type { GuardianAlbumFilterDay } from '@views/guardian-album-page/ui/GuardianAlbumFilterDaySection';

interface GuardianAlbumDayPhotoSource {
  photos: GuardianAlbumPhoto[];
  photoCount: number;
}

/**
 * 등원일/즐겨찾기 프리뷰와 월별 카드 사진을 id 기준으로 합친다.
 * attended-days 프리뷰가 짧게 truncate된 경우 월 API 사진으로 보완.
 */
function mergeGuardianAlbumDayPhotos(
  primary: GuardianAlbumFilterDay,
  secondary?: GuardianAlbumDayPhotoSource | null
): GuardianAlbumFilterDay {
  if (!secondary || secondary.photos.length === 0) return primary;

  const byId = new Map<string, GuardianAlbumPhoto>();
  for (const photo of primary.photos) byId.set(photo.id, photo);
  for (const photo of secondary.photos) {
    if (!byId.has(photo.id)) byId.set(photo.id, photo);
  }

  const photos = Array.from(byId.values()).sort(
    (left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime()
  );

  return {
    ...primary,
    photos,
    photoCount: Math.max(primary.photoCount, secondary.photoCount, photos.length),
  };
}

export { mergeGuardianAlbumDayPhotos };
export type { GuardianAlbumDayPhotoSource };

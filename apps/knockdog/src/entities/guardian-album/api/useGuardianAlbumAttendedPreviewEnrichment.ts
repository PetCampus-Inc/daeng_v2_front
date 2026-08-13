import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { GuardianAlbumDay } from '../model/guardianAlbumDay';
import { toGuardianAlbumPhoto, type GuardianAlbumPhoto } from '../model/guardianAlbumPhoto';
import { getGuardianAlbumDayPhotos } from './guardianAlbumDayPhotos';

const GUARDIAN_ALBUM_DAY_PHOTOS_QUERY_KEY = 'guardianAlbumDayPhotos';

/** 등원일/즐겨찾기 그리드 한 번에 보이는 최대 장수 */
const ATTENDANCE_PREVIEW_LIMIT = 6;

const guardianAlbumDayPhotosQueryKey = (userId?: string, schoolId?: string, date?: string) =>
  [GUARDIAN_ALBUM_DAY_PHOTOS_QUERY_KEY, userId, schoolId, date] as const;

interface UseGuardianAlbumDayPreviewEnrichmentOptions {
  userId?: string;
  schoolId?: string | null;
  day: GuardianAlbumDay;
  enabled?: boolean;
  previewLimit?: number;
}

function needsPreviewEnrichment(day: GuardianAlbumDay, previewLimit: number) {
  const targetCount = Math.min(day.photoCount, previewLimit);
  return day.photos.length < targetCount;
}

function mergeDayPhotos(
  primary: GuardianAlbumPhoto[],
  secondary: GuardianAlbumPhoto[]
): GuardianAlbumPhoto[] {
  const byId = new Map<string, GuardianAlbumPhoto>();
  for (const photo of primary) byId.set(photo.id, photo);
  for (const photo of secondary) {
    if (!byId.has(photo.id)) byId.set(photo.id, photo);
  }
  return Array.from(byId.values()).sort(
    (left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime()
  );
}

/**
 * attended-days previewPhotos(BE 4장 고정)를
 * `GET albums/{schoolId}/photos?date=`로 최대 previewLimit장까지 보완.
 * 호출부에서 화면에 들어온 카드에만 `enabled`를 켠다.
 */
function useGuardianAlbumDayPreviewEnrichment({
  userId,
  schoolId,
  day,
  enabled = true,
  previewLimit = ATTENDANCE_PREVIEW_LIMIT,
}: UseGuardianAlbumDayPreviewEnrichmentOptions) {
  const shouldFetch = enabled && needsPreviewEnrichment(day, previewLimit);

  const query = useQuery({
    queryKey: guardianAlbumDayPhotosQueryKey(userId, schoolId ?? undefined, day.dateKey),
    queryFn: async () => {
      const response = await getGuardianAlbumDayPhotos({
        schoolId: schoolId!,
        date: day.dateKey,
        size: previewLimit,
      });
      return (response.data?.photos ?? [])
        .map(toGuardianAlbumPhoto)
        .filter((photo): photo is GuardianAlbumPhoto => photo != null);
    },
    enabled: shouldFetch && Boolean(userId) && Boolean(schoolId),
    staleTime: 60_000,
  });

  const enrichedDay = useMemo(() => {
    if (!query.data || query.data.length === 0) return day;
    const photos = mergeDayPhotos(day.photos, query.data).slice(0, previewLimit);
    return {
      ...day,
      photos,
      photoCount: Math.max(day.photoCount, photos.length),
    };
  }, [day, previewLimit, query.data]);

  return {
    day: enrichedDay,
    isEnriching: query.isFetching,
  };
}

export {
  ATTENDANCE_PREVIEW_LIMIT,
  GUARDIAN_ALBUM_DAY_PHOTOS_QUERY_KEY,
  guardianAlbumDayPhotosQueryKey,
  useGuardianAlbumDayPreviewEnrichment,
};
export type { UseGuardianAlbumDayPreviewEnrichmentOptions };

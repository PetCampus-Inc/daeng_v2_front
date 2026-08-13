import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { GuardianAlbumDay } from '../model/guardianAlbumDay';
import { toGuardianAlbumPhoto, type GuardianAlbumPhoto } from '../model/guardianAlbumPhoto';
import { getGuardianAlbumDayPhotos } from './guardianAlbumDayPhotos';

const GUARDIAN_ALBUM_DAY_PHOTOS_QUERY_KEY = 'guardianAlbumDayPhotos';

/** 등원일/즐겨찾기 그리드 한 번에 보이는 최대 장수 */
const ATTENDANCE_PREVIEW_LIMIT = 6;

const guardianAlbumDayPhotosQueryKey = (userId?: string, schoolId?: string, date?: string) =>
  [GUARDIAN_ALBUM_DAY_PHOTOS_QUERY_KEY, userId, schoolId, date] as const;

interface UseGuardianAlbumAttendedPreviewEnrichmentOptions {
  userId?: string;
  schoolId?: string | null;
  days: GuardianAlbumDay[];
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
 */
function useGuardianAlbumAttendedPreviewEnrichment({
  userId,
  schoolId,
  days,
  enabled = true,
  previewLimit = ATTENDANCE_PREVIEW_LIMIT,
}: UseGuardianAlbumAttendedPreviewEnrichmentOptions) {
  const daysNeedingEnrichment = useMemo(
    () => days.filter((day) => needsPreviewEnrichment(day, previewLimit)),
    [days, previewLimit]
  );

  const queries = useQueries({
    queries: daysNeedingEnrichment.map((day) => ({
      queryKey: guardianAlbumDayPhotosQueryKey(userId, schoolId ?? undefined, day.dateKey),
      queryFn: async () => {
        const response = await getGuardianAlbumDayPhotos({
          schoolId: schoolId!,
          date: day.dateKey,
          size: Math.min(Math.max(day.photoCount, previewLimit), 30),
        });
        return (response.data?.photos ?? [])
          .map(toGuardianAlbumPhoto)
          .filter((photo): photo is GuardianAlbumPhoto => photo != null);
      },
      enabled: enabled && Boolean(userId) && Boolean(schoolId),
      staleTime: 60_000,
    })),
  });

  const photosByDate = useMemo(() => {
    const map = new Map<string, GuardianAlbumPhoto[]>();
    daysNeedingEnrichment.forEach((day, index) => {
      const photos = queries[index]?.data;
      if (photos && photos.length > 0) map.set(day.dateKey, photos);
    });
    return map;
  }, [daysNeedingEnrichment, queries]);

  const enrichedDays = useMemo(() => {
    return days.map((day) => {
      const fetched = photosByDate.get(day.dateKey);
      if (!fetched) return day;
      const photos = mergeDayPhotos(day.photos, fetched);
      return {
        ...day,
        photos,
        photoCount: Math.max(day.photoCount, photos.length),
      };
    });
  }, [days, photosByDate]);

  return {
    days: enrichedDays,
    isEnriching: queries.some((query) => query.isFetching),
  };
}

export {
  ATTENDANCE_PREVIEW_LIMIT,
  GUARDIAN_ALBUM_DAY_PHOTOS_QUERY_KEY,
  guardianAlbumDayPhotosQueryKey,
  useGuardianAlbumAttendedPreviewEnrichment,
};

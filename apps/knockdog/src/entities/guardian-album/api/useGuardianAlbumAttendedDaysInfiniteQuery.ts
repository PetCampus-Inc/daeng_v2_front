import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { toGuardianAlbumAttendedDaysPage } from '../model/guardianAlbumAttendedDays';
import type { GuardianAlbumAttendedDaysPage } from '../model/guardianAlbumAttendedDays';
import { getGuardianAlbumAttendedDays } from './guardianAlbumAttendedDays';

const GUARDIAN_ALBUM_ATTENDED_DAYS_QUERY_KEY = 'guardianAlbumAttendedDays';

const guardianAlbumAttendedDaysQueryKey = (
  userId?: string,
  schoolId?: string,
  petId?: string,
  size?: number
) => [GUARDIAN_ALBUM_ATTENDED_DAYS_QUERY_KEY, userId, schoolId, petId, size] as const;

type GuardianAlbumAttendedDaysCache = InfiniteData<GuardianAlbumAttendedDaysPage, string | undefined>;

interface UseGuardianAlbumAttendedDaysInfiniteQueryOptions {
  userId?: string;
  schoolId?: string | null;
  petId?: string | null;
  size?: number;
  enabled?: boolean;
}

function useGuardianAlbumAttendedDaysInfiniteQuery({
  userId,
  schoolId,
  petId,
  size = 7,
  enabled = true,
}: UseGuardianAlbumAttendedDaysInfiniteQueryOptions = {}) {
  return useInfiniteQuery({
    queryKey: guardianAlbumAttendedDaysQueryKey(
      userId,
      schoolId ?? undefined,
      petId ?? undefined,
      size
    ),
    queryFn: async ({ pageParam }) => {
      const response = await getGuardianAlbumAttendedDays({
        schoolId: schoolId!,
        petId: petId!,
        cursor: pageParam,
        size,
      });

      return toGuardianAlbumAttendedDaysPage(response.data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: enabled && Boolean(userId) && Boolean(schoolId) && Boolean(petId),
    staleTime: 0,
  });
}

export {
  GUARDIAN_ALBUM_ATTENDED_DAYS_QUERY_KEY,
  guardianAlbumAttendedDaysQueryKey,
  useGuardianAlbumAttendedDaysInfiniteQuery,
};
export type { GuardianAlbumAttendedDaysCache };

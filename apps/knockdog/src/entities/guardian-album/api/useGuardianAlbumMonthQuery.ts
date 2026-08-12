import { useQuery } from '@tanstack/react-query';

import { toGuardianAlbumMonth } from '../model/guardianAlbumMonth';
import { getGuardianAlbumMonth } from './guardianAlbumMonth';

const GUARDIAN_ALBUM_MONTH_QUERY_KEY = 'guardianAlbumMonth';

const guardianAlbumMonthQueryKey = (
  userId?: string,
  schoolId?: string,
  petId?: string,
  yearMonth?: string
) => [GUARDIAN_ALBUM_MONTH_QUERY_KEY, userId, schoolId, petId, yearMonth] as const;

interface UseGuardianAlbumMonthQueryOptions {
  userId?: string;
  schoolId?: string | null;
  petId?: string | null;
  yearMonth?: string | null;
  enabled?: boolean;
}

function useGuardianAlbumMonthQuery({
  userId,
  schoolId,
  petId,
  yearMonth,
  enabled = true,
}: UseGuardianAlbumMonthQueryOptions = {}) {
  return useQuery({
    queryKey: guardianAlbumMonthQueryKey(
      userId,
      schoolId ?? undefined,
      petId ?? undefined,
      yearMonth ?? undefined
    ),
    queryFn: () =>
      getGuardianAlbumMonth({
        schoolId: schoolId!,
        yearMonth: yearMonth!,
        petId: petId!,
      }),
    select: (response) => toGuardianAlbumMonth(response.data),
    enabled:
      enabled &&
      Boolean(userId) &&
      Boolean(schoolId) &&
      Boolean(petId) &&
      Boolean(yearMonth),
    staleTime: 0,
  });
}

export {
  GUARDIAN_ALBUM_MONTH_QUERY_KEY,
  guardianAlbumMonthQueryKey,
  useGuardianAlbumMonthQuery,
};

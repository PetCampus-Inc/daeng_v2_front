import { useQuery } from '@tanstack/react-query';

import { toGuardianAlbumToday } from '../model/guardianAlbumToday';
import { getGuardianAlbumToday } from './guardianAlbumToday';

const GUARDIAN_ALBUM_TODAY_QUERY_KEY = 'guardianAlbumToday';

const guardianAlbumTodayQueryKey = (userId?: string, schoolId?: string, petId?: string) =>
  [GUARDIAN_ALBUM_TODAY_QUERY_KEY, userId, schoolId, petId] as const;

interface UseGuardianAlbumTodayQueryOptions {
  userId?: string;
  schoolId?: string | null;
  petId?: string | null;
  enabled?: boolean;
}

function useGuardianAlbumTodayQuery({
  userId,
  schoolId,
  petId,
  enabled = true,
}: UseGuardianAlbumTodayQueryOptions = {}) {
  return useQuery({
    queryKey: guardianAlbumTodayQueryKey(userId, schoolId ?? undefined, petId ?? undefined),
    queryFn: () => getGuardianAlbumToday({ schoolId: schoolId!, petId: petId! }),
    select: (response) => toGuardianAlbumToday(response.data),
    enabled: enabled && Boolean(userId) && Boolean(schoolId) && Boolean(petId),
    staleTime: 0,
  });
}

export {
  GUARDIAN_ALBUM_TODAY_QUERY_KEY,
  guardianAlbumTodayQueryKey,
  useGuardianAlbumTodayQuery,
};

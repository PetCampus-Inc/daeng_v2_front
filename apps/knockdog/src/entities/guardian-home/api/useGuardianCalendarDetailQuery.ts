import { useQuery } from '@tanstack/react-query';

import { toGuardianCalendarDetail } from '../model/guardianCalendarDetail';
import { getGuardianCalendarDetail } from './guardianCalendarDetail';

const GUARDIAN_CALENDAR_DETAIL_QUERY_KEY = 'guardianCalendarDetail';

const guardianCalendarDetailQueryKey = (
  userId?: string,
  petId?: string,
  date?: string,
  schoolId?: string
) => [GUARDIAN_CALENDAR_DETAIL_QUERY_KEY, userId, petId, date, schoolId] as const;

interface UseGuardianCalendarDetailQueryOptions {
  userId?: string;
  petId?: string | null;
  date?: string | null;
  schoolId?: string | null;
  enabled?: boolean;
}

function useGuardianCalendarDetailQuery({
  userId,
  petId,
  date,
  schoolId,
  enabled = true,
}: UseGuardianCalendarDetailQueryOptions = {}) {
  return useQuery({
    queryKey: guardianCalendarDetailQueryKey(
      userId,
      petId ?? undefined,
      date ?? undefined,
      schoolId ?? undefined
    ),
    queryFn: () =>
      getGuardianCalendarDetail({
        petId: petId!,
        date: date!,
        schoolId: schoolId ?? undefined,
      }),
    select: (response) => toGuardianCalendarDetail(response.data),
    enabled: enabled && Boolean(userId) && Boolean(petId) && Boolean(date),
    staleTime: 0,
  });
}

export {
  GUARDIAN_CALENDAR_DETAIL_QUERY_KEY,
  guardianCalendarDetailQueryKey,
  useGuardianCalendarDetailQuery,
};

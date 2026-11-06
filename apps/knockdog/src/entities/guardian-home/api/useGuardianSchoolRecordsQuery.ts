import { useQuery } from '@tanstack/react-query';

import { toGuardianSchoolRecords } from '../model/guardianSchoolRecords';
import { getGuardianSchoolRecords } from './guardianSchoolRecords';

const GUARDIAN_SCHOOL_RECORDS_QUERY_KEY = 'guardianSchoolRecords';

const guardianSchoolRecordsQueryKey = (
  userId?: string,
  petId?: string,
  schoolId?: string,
  yearMonth?: string
) => [GUARDIAN_SCHOOL_RECORDS_QUERY_KEY, userId, petId, schoolId, yearMonth] as const;

interface UseGuardianSchoolRecordsQueryOptions {
  userId?: string;
  petId?: string | null;
  schoolId?: string | null;
  yearMonth?: string;
  enabled?: boolean;
}

function useGuardianSchoolRecordsQuery({
  userId,
  petId,
  schoolId,
  yearMonth,
  enabled = true,
}: UseGuardianSchoolRecordsQueryOptions = {}) {
  return useQuery({
    queryKey: guardianSchoolRecordsQueryKey(
      userId,
      petId ?? undefined,
      schoolId ?? undefined,
      yearMonth
    ),
    queryFn: () =>
      getGuardianSchoolRecords({
        petId: petId!,
        schoolId: schoolId!,
        yearMonth: yearMonth!,
      }),
    select: (response) => toGuardianSchoolRecords(response.data),
    enabled: enabled && Boolean(userId) && Boolean(petId) && Boolean(schoolId) && Boolean(yearMonth),
    staleTime: 60_000,
  });
}

export {
  GUARDIAN_SCHOOL_RECORDS_QUERY_KEY,
  guardianSchoolRecordsQueryKey,
  useGuardianSchoolRecordsQuery,
};

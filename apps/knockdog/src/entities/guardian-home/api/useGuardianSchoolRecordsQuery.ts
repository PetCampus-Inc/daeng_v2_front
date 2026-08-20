import { useQuery } from '@tanstack/react-query';

import { toGuardianSchoolRecords } from '../model/guardianSchoolRecords';
import { getGuardianSchoolRecords } from './guardianSchoolRecords';

const GUARDIAN_SCHOOL_RECORDS_QUERY_KEY = 'guardianSchoolRecords';

const guardianSchoolRecordsQueryKey = (userId?: string, membershipId?: string, yearMonth?: string) =>
  [GUARDIAN_SCHOOL_RECORDS_QUERY_KEY, userId, membershipId, yearMonth] as const;

interface UseGuardianSchoolRecordsQueryOptions {
  userId?: string;
  membershipId?: string | null;
  yearMonth?: string;
  enabled?: boolean;
}

function useGuardianSchoolRecordsQuery({
  userId,
  membershipId,
  yearMonth,
  enabled = true,
}: UseGuardianSchoolRecordsQueryOptions = {}) {
  return useQuery({
    queryKey: guardianSchoolRecordsQueryKey(userId, membershipId ?? undefined, yearMonth),
    queryFn: () =>
      getGuardianSchoolRecords({
        membershipId: membershipId!,
        yearMonth: yearMonth!,
      }),
    select: (response) => toGuardianSchoolRecords(response.data),
    enabled: enabled && Boolean(userId) && Boolean(membershipId) && Boolean(yearMonth),
    staleTime: 60_000,
  });
}

export {
  GUARDIAN_SCHOOL_RECORDS_QUERY_KEY,
  guardianSchoolRecordsQueryKey,
  useGuardianSchoolRecordsQuery,
};

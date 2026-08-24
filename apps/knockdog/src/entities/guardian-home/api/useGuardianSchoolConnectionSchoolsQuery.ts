import { useQuery } from '@tanstack/react-query';

import { toGuardianSchoolConnections } from '../model/guardianSchoolConnection';
import { getGuardianSchoolConnectionSchools } from './guardianSchoolConnectionSchools';

const GUARDIAN_SCHOOL_CONNECTION_SCHOOLS_QUERY_KEY = 'guardianSchoolConnectionSchools';

const guardianSchoolConnectionSchoolsQueryKey = (userId?: string, petId?: string) =>
  [GUARDIAN_SCHOOL_CONNECTION_SCHOOLS_QUERY_KEY, userId, petId] as const;

interface UseGuardianSchoolConnectionSchoolsQueryOptions {
  userId?: string;
  petId?: string | null;
  enabled?: boolean;
}

function useGuardianSchoolConnectionSchoolsQuery({
  userId,
  petId,
  enabled = true,
}: UseGuardianSchoolConnectionSchoolsQueryOptions = {}) {
  return useQuery({
    queryKey: guardianSchoolConnectionSchoolsQueryKey(userId, petId ?? undefined),
    queryFn: () => getGuardianSchoolConnectionSchools({ petId: petId! }),
    select: (response) => toGuardianSchoolConnections(response.data),
    enabled: enabled && Boolean(userId) && Boolean(petId),
    staleTime: 0,
  });
}

export {
  GUARDIAN_SCHOOL_CONNECTION_SCHOOLS_QUERY_KEY,
  guardianSchoolConnectionSchoolsQueryKey,
  useGuardianSchoolConnectionSchoolsQuery,
};

import { useQuery } from '@tanstack/react-query';

import { toGuardianSchoolConnections } from '../model/guardianSchoolConnection';
import { getGuardianSchoolConnections } from './guardianSchoolConnections';

const GUARDIAN_SCHOOL_CONNECTIONS_QUERY_KEY = 'guardianSchoolConnections';

const guardianSchoolConnectionsQueryKey = (userId?: string, petId?: string) =>
  [GUARDIAN_SCHOOL_CONNECTIONS_QUERY_KEY, userId, petId] as const;

interface UseGuardianSchoolConnectionsQueryOptions {
  userId?: string;
  petId?: string | null;
  enabled?: boolean;
}

function useGuardianSchoolConnectionsQuery({
  userId,
  petId,
  enabled = true,
}: UseGuardianSchoolConnectionsQueryOptions = {}) {
  return useQuery({
    queryKey: guardianSchoolConnectionsQueryKey(userId, petId ?? undefined),
    queryFn: () => getGuardianSchoolConnections({ petId: petId! }),
    select: (response) => toGuardianSchoolConnections(response.data),
    enabled: enabled && Boolean(userId) && Boolean(petId),
    staleTime: 0,
  });
}

export {
  GUARDIAN_SCHOOL_CONNECTIONS_QUERY_KEY,
  guardianSchoolConnectionsQueryKey,
  useGuardianSchoolConnectionsQuery,
};

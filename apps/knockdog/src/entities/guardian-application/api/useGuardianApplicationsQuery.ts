import { useQuery } from '@tanstack/react-query';

import { toGuardianApplications } from '../model/guardianApplication';
import { getGuardianApplications } from './guardianApplications';

const GUARDIAN_APPLICATIONS_QUERY_KEY = 'guardianApplications';

const guardianApplicationsQueryKey = (userId?: string) =>
  [GUARDIAN_APPLICATIONS_QUERY_KEY, userId] as const;

interface UseGuardianApplicationsQueryOptions {
  userId?: string;
  enabled?: boolean;
}

function useGuardianApplicationsQuery({
  userId,
  enabled = true,
}: UseGuardianApplicationsQueryOptions = {}) {
  return useQuery({
    queryKey: guardianApplicationsQueryKey(userId),
    queryFn: () => getGuardianApplications(),
    select: (response) => toGuardianApplications(response.data),
    enabled: enabled && Boolean(userId),
    staleTime: 0,
  });
}

export {
  GUARDIAN_APPLICATIONS_QUERY_KEY,
  guardianApplicationsQueryKey,
  useGuardianApplicationsQuery,
};

import { useQuery } from '@tanstack/react-query';

import { getGuardianInvite, getGuardianPetConnectionStatuses } from './guardianInvite';

const guardianInviteQueryKey = (token: string) => ['guardianInvite', token] as const;
const GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY = 'guardianPetConnectionStatuses';
const guardianPetConnectionStatusesQueryKey = (userId?: string) =>
  [GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY, userId] as const;

function useGuardianInviteQuery(token: string) {
  return useQuery({
    queryKey: guardianInviteQueryKey(token),
    queryFn: () => getGuardianInvite(token),
    enabled: Boolean(token),
    retry: false,
  });
}

interface UseGuardianPetConnectionStatusesQueryOptions {
  userId?: string;
  enabled?: boolean;
}

function useGuardianPetConnectionStatusesQuery({
  userId,
  enabled = true,
}: UseGuardianPetConnectionStatusesQueryOptions = {}) {
  return useQuery({
    // API가 세션 기반이므로 사용자별로 캐시를 분리한다.
    queryKey: guardianPetConnectionStatusesQueryKey(userId),
    queryFn: getGuardianPetConnectionStatuses,
    enabled: enabled && Boolean(userId),
  });
}

export {
  guardianInviteQueryKey,
  GUARDIAN_PET_CONNECTION_STATUSES_QUERY_KEY,
  guardianPetConnectionStatusesQueryKey,
  useGuardianInviteQuery,
  useGuardianPetConnectionStatusesQuery,
};

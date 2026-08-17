import { useQuery } from '@tanstack/react-query';

import { getGuardianInvite, getGuardianPetConnectionStatuses } from './guardianInvite';

const guardianInviteQueryKey = (token: string) => ['guardianInvite', token] as const;
const guardianPetConnectionStatusesQueryKey = ['guardianPetConnectionStatuses'] as const;

function useGuardianInviteQuery(token: string) {
  return useQuery({
    queryKey: guardianInviteQueryKey(token),
    queryFn: () => getGuardianInvite(token),
    enabled: Boolean(token),
    retry: false,
  });
}

function useGuardianPetConnectionStatusesQuery() {
  return useQuery({
    queryKey: guardianPetConnectionStatusesQueryKey,
    queryFn: getGuardianPetConnectionStatuses,
  });
}

export {
  guardianInviteQueryKey,
  guardianPetConnectionStatusesQueryKey,
  useGuardianInviteQuery,
  useGuardianPetConnectionStatusesQuery,
};

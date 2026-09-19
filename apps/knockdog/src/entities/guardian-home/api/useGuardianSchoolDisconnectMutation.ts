import { useMutation, useQueryClient } from '@tanstack/react-query';

import { guardianApplicationsQueryKey } from '@entities/guardian-application';
import { guardianPetConnectionStatusesQueryKey } from '@entities/guardian-invite';

import { postDisconnectGuardianSchool } from './guardianSchoolDisconnect';
import { GUARDIAN_HOME_QUERY_KEY } from './useGuardianHomeQuery';
import { GUARDIAN_SCHOOL_CONNECTION_SCHOOLS_QUERY_KEY } from './useGuardianSchoolConnectionSchoolsQuery';
import { GUARDIAN_SCHOOL_CONNECTIONS_QUERY_KEY } from './useGuardianSchoolConnectionsQuery';

interface UseGuardianSchoolDisconnectMutationOptions {
  userId?: string;
}

function useGuardianSchoolDisconnectMutation({
  userId,
}: UseGuardianSchoolDisconnectMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postDisconnectGuardianSchool,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [GUARDIAN_HOME_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [GUARDIAN_SCHOOL_CONNECTIONS_QUERY_KEY] }),
        queryClient.invalidateQueries({
          queryKey: [GUARDIAN_SCHOOL_CONNECTION_SCHOOLS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({ queryKey: guardianApplicationsQueryKey(userId) }),
        queryClient.invalidateQueries({
          queryKey: guardianPetConnectionStatusesQueryKey(userId),
        }),
      ]);
    },
  });
}

export { useGuardianSchoolDisconnectMutation };

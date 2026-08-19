import { useMutation, useQueryClient } from '@tanstack/react-query';

import { guardianPetConnectionStatusesQueryKey } from '@entities/guardian-invite';

import { postCancelGuardianApplication } from './guardianApplications';
import { guardianApplicationsQueryKey } from './useGuardianApplicationsQuery';

interface UseCancelGuardianApplicationMutationOptions {
  userId?: string;
}

function useCancelGuardianApplicationMutation({
  userId,
}: UseCancelGuardianApplicationMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCancelGuardianApplication,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: guardianApplicationsQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: guardianPetConnectionStatusesQueryKey(userId) }),
      ]);
    },
  });
}

export { useCancelGuardianApplicationMutation };

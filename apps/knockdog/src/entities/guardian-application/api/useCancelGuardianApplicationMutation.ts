import { useMutation, useQueryClient } from '@tanstack/react-query';

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
      await queryClient.invalidateQueries({ queryKey: guardianApplicationsQueryKey(userId) });
    },
  });
}

export { useCancelGuardianApplicationMutation };

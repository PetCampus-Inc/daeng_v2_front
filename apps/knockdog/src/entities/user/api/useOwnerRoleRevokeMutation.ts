'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUserStore } from '../model/store/useUserStore';
import { postRevokeOwnerRole } from './revokeOwnerRole';
import { ownerMypageSummaryQueryKey, ownerRoleQueryKey } from './useUserQuery';

function useOwnerRoleRevokeMutation() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: postRevokeOwnerRole,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerRoleQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: ownerMypageSummaryQueryKey(userId) }),
      ]);
    },
  });
}

export { useOwnerRoleRevokeMutation };

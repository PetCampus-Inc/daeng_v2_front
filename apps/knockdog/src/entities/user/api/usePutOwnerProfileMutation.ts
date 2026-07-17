'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useUserStore } from '../model/store/useUserStore';
import { putOwnerProfile } from './user';
import {
  ownerMypageSummaryQueryKey,
  ownerProfileQueryKey,
  ownerRoleQueryKey,
} from './useUserQuery';

function usePutOwnerProfileMutation() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: putOwnerProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerProfileQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: ownerMypageSummaryQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: ownerRoleQueryKey(userId) }),
      ]);
    },
  });
}

export { usePutOwnerProfileMutation };

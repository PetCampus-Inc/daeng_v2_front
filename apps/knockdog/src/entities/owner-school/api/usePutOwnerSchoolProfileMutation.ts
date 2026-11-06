'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { kindergartenBasicQueryKeys } from '@entities/kindergarten/config/kindergartenBasicQueryKeys';
import { kindergartenQueries } from '@entities/kindergarten/config/kindergartenQueries';
import { useUserStore } from '@entities/user';

import { putOwnerSchoolProfile } from './putOwnerSchoolProfile';
import { ownerSchoolProfileQueryKey } from './useOwnerSchoolProfileQuery';

interface UsePutOwnerSchoolProfileMutationOptions {
  kindergartenId?: string;
}

function usePutOwnerSchoolProfileMutation({
  kindergartenId,
}: UsePutOwnerSchoolProfileMutationOptions = {}) {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: putOwnerSchoolProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ownerSchoolProfileQueryKey(userId) });

      if (kindergartenId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: kindergartenBasicQueryKeys.byId(kindergartenId),
          }),
          queryClient.invalidateQueries({
            queryKey: [...kindergartenQueries.keys.all(), 'main', kindergartenId],
          }),
        ]);
      }
    },
  });
}

export { usePutOwnerSchoolProfileMutation };

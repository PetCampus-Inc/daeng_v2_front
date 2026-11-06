'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { pricingQueryKeys } from '@entities/pricing/config/pricingQueryKeys';
import { useUserStore } from '@entities/user';

import { putOwnerSchoolPrice } from './putOwnerSchoolPrice';
import { ownerSchoolProfileQueryKey } from './useOwnerSchoolProfileQuery';

interface UsePutOwnerSchoolPriceMutationOptions {
  kindergartenId?: string;
}

function usePutOwnerSchoolPriceMutation({
  kindergartenId,
}: UsePutOwnerSchoolPriceMutationOptions = {}) {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: putOwnerSchoolPrice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ownerSchoolProfileQueryKey(userId) });

      if (kindergartenId) {
        await queryClient.invalidateQueries({
          queryKey: pricingQueryKeys.byId(kindergartenId),
        });
      }
    },
  });
}

export { usePutOwnerSchoolPriceMutation };

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postPetTicket, type PostPetTicketParams } from './petTicket';
import { petTicketQueryKeys } from '../config/petTicketQueryKeys';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const useChargePetTicketMutation = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<PostPetTicketParams, 'petId'>) => postPetTicket({ petId, ...params }),
    onSuccess: async () => {
      const queryKey = petTicketQueryKeys.byPet(petId);
      await queryClient.invalidateQueries({ queryKey });
      syncWebViewQuery.invalidate(queryKey);
    },
  });
};

export { useChargePetTicketMutation };

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postPetTicketHold } from './petTicket';
import { petTicketQueryKeys } from '../config/petTicketQueryKeys';

import type { PetTicketHoldRequest } from '../model/petTicket';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const usePetTicketHoldMutation = (petId: string, ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PetTicketHoldRequest) => postPetTicketHold({ petId, ticketId, body }),
    onSuccess: async (detail) => {
      const listKey = petTicketQueryKeys.byPet(petId);
      const detailKey = petTicketQueryKeys.detail(petId, ticketId);
      const historyKey = petTicketQueryKeys.history(petId, ticketId);
      queryClient.setQueryData(detailKey, detail);
      await queryClient.invalidateQueries({ queryKey: listKey, exact: true });
      await queryClient.invalidateQueries({ queryKey: historyKey });
      syncWebViewQuery.invalidate(listKey);
      syncWebViewQuery.invalidate(detailKey);
      syncWebViewQuery.invalidate(historyKey);
    },
  });
};

export { usePetTicketHoldMutation };

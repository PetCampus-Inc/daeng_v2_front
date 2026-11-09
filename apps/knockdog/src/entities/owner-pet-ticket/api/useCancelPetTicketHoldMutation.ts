import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePetTicketHold } from './petTicket';
import { petTicketQueryKeys } from '../config/petTicketQueryKeys';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const useCancelPetTicketHoldMutation = (petId: string, ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePetTicketHold(petId, ticketId),
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

export { useCancelPetTicketHoldMutation };

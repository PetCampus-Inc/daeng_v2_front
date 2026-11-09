import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchPetTicketExpiry } from './petTicket';
import { petTicketQueryKeys } from '../config/petTicketQueryKeys';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const usePetTicketExpiryMutation = (petId: string, ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expiresOn: string) => patchPetTicketExpiry({ petId, ticketId, body: { expiresOn } }),
    onSuccess: async (detail) => {
      const listKey = petTicketQueryKeys.byPet(petId);
      const detailKey = petTicketQueryKeys.detail(petId, ticketId);
      const historyKey = petTicketQueryKeys.history(petId, ticketId);
      await queryClient.cancelQueries({ queryKey: detailKey, exact: true });
      queryClient.setQueryData(detailKey, detail);
      await queryClient.invalidateQueries({ queryKey: listKey, exact: true });
      await queryClient.invalidateQueries({ queryKey: historyKey });
      syncWebViewQuery.invalidate(listKey);
      syncWebViewQuery.invalidate(detailKey);
      syncWebViewQuery.invalidate(historyKey);
    },
  });
};

export { usePetTicketExpiryMutation };

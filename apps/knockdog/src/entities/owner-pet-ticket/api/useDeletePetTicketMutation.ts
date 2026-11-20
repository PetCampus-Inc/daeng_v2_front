import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePetTicket } from './petTicket';
import { petTicketQueryKeys } from '../config/petTicketQueryKeys';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const useDeletePetTicketMutation = (petId: string, ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePetTicket(petId, ticketId),
    onSuccess: async () => {
      const listKey = petTicketQueryKeys.byPet(petId);
      const detailKey = petTicketQueryKeys.detail(petId, ticketId);
      queryClient.removeQueries({ queryKey: detailKey });
      await queryClient.invalidateQueries({ queryKey: listKey, exact: true });
      syncWebViewQuery.invalidate(listKey);
      syncWebViewQuery.invalidate(detailKey);
    },
  });
};

export { useDeletePetTicketMutation };

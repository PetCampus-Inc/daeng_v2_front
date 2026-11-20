import { useMutation, useQueryClient } from '@tanstack/react-query';

import { guardianTicketQueryKeys } from '../config/guardianTicketQueryKeys';
import { deleteGuardianTicket } from './guardianTicket';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

const useDeleteTicketMutation = (petId: string, ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGuardianTicket(petId, ticketId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: guardianTicketQueryKeys.detail(petId, ticketId) });
      await queryClient.invalidateQueries({ queryKey: guardianTicketQueryKeys.all });
      syncWebViewQuery.invalidate([...guardianTicketQueryKeys.all]);
    },
  });
};

export { useDeleteTicketMutation };

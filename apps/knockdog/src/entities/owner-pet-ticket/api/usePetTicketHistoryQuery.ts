import { useQuery } from '@tanstack/react-query';

import { createPetTicketHistoryOptions } from '../config/petTicketQueryKeys';

const usePetTicketHistoryQuery = (petId: string, ticketId: string) =>
  useQuery({
    ...createPetTicketHistoryOptions(petId, ticketId),
    enabled: Boolean(petId) && Boolean(ticketId),
    staleTime: 0,
  });

export { usePetTicketHistoryQuery };

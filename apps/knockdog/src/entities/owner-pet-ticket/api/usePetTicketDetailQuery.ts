import { useQuery } from '@tanstack/react-query';

import { createPetTicketDetailOptions } from '../config/petTicketQueryKeys';

const usePetTicketDetailQuery = (petId: string, ticketId: string) =>
  useQuery({
    ...createPetTicketDetailOptions(petId, ticketId),
    enabled: Boolean(petId) && Boolean(ticketId),
    staleTime: 0,
  });

export { usePetTicketDetailQuery };

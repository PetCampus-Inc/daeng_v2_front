import { useQuery } from '@tanstack/react-query';

import { createTicketDetailOptions } from '../config/guardianTicketQueryKeys';

const useGuardianTicketDetailQuery = (petId: string, ticketId: string) =>
  useQuery({
    ...createTicketDetailOptions(petId, ticketId),
    enabled: Boolean(petId) && Boolean(ticketId),
    staleTime: 0,
  });

export { useGuardianTicketDetailQuery };

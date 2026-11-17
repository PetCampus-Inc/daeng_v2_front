import { useQuery } from '@tanstack/react-query';

import { createTicketCardOptions } from '../config/guardianTicketQueryKeys';

const useGuardianTicketCardQuery = (petId: string) =>
  useQuery({
    ...createTicketCardOptions(petId),
    enabled: Boolean(petId),
    staleTime: 0,
  });

export { useGuardianTicketCardQuery };

import { useQuery } from '@tanstack/react-query';

import { createTicketManageOptions } from '../config/guardianTicketQueryKeys';

const useGuardianTicketManageQuery = (petId: string) =>
  useQuery({
    ...createTicketManageOptions(petId),
    enabled: Boolean(petId),
    staleTime: 0,
  });

export { useGuardianTicketManageQuery };

import { useQuery } from '@tanstack/react-query';

import { createPetTicketQueryOptions } from '../config/petTicketQueryKeys';

const usePetTicketListQuery = (petId: string) =>
  useQuery({
    ...createPetTicketQueryOptions(petId),
    enabled: Boolean(petId),
    staleTime: 0,
  });

export { usePetTicketListQuery };

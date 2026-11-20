import { useQuery } from '@tanstack/react-query';

import { createSlotsOptions } from '../config/guardianReservationQueryKeys';

const useReservationSlotsQuery = (petId: string, date: string, ticketId: string) =>
  useQuery({
    ...createSlotsOptions(petId, date, ticketId),
    enabled: Boolean(petId) && Boolean(date),
    staleTime: 0,
  });

export { useReservationSlotsQuery };

import { useQuery } from '@tanstack/react-query';

import { createCalendarOptions } from '../config/guardianReservationQueryKeys';

const useReservationCalendarQuery = (petId: string, month: string, ticketId: string) =>
  useQuery({
    ...createCalendarOptions(petId, month, ticketId),
    enabled: Boolean(petId) && /^\d{4}-\d{2}$/.test(month),
    staleTime: 0,
  });

export { useReservationCalendarQuery };

import { useQuery } from '@tanstack/react-query';

import { createReservationDetailOptions } from '../config/guardianReservationQueryKeys';

const useReservationDetailQuery = (petId: string, reservationId: string) =>
  useQuery({
    ...createReservationDetailOptions(petId, reservationId),
    enabled: Boolean(petId) && Boolean(reservationId),
    staleTime: 0,
  });

export { useReservationDetailQuery };

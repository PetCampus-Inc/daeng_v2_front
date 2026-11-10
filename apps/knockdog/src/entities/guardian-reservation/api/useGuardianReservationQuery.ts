import { useQuery } from '@tanstack/react-query';

import { createReservationListOptions } from '../config/guardianReservationQueryKeys';
import type { ReservationPeriod, ReservationScope } from './guardianReservation';

const useGuardianReservationQuery = (petId: string, scope: ReservationScope, period?: ReservationPeriod) =>
  useQuery({
    ...createReservationListOptions(petId, scope, period),
    enabled: Boolean(petId),
    staleTime: 0,
  });

export { useGuardianReservationQuery };

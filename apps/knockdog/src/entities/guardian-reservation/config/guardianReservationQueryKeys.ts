import { getGuardianReservations, type ReservationPeriod, type ReservationScope } from '../api/guardianReservation';
import { toGuardianReservations } from '../model/guardianReservation';

const GUARDIAN_RESERVATION_KEY = 'guardian-reservation';

const guardianReservationQueryKeys = {
  all: [GUARDIAN_RESERVATION_KEY] as const,
  list: (petId: string, scope: ReservationScope, period?: ReservationPeriod) =>
    [GUARDIAN_RESERVATION_KEY, petId, scope, period ?? ''] as const,
};

const createReservationListOptions = (petId: string, scope: ReservationScope, period?: ReservationPeriod) => ({
  queryKey: guardianReservationQueryKeys.list(petId, scope, period),
  queryFn: () => getGuardianReservations({ petId, scope, period }),
  select: toGuardianReservations,
});

export { createReservationListOptions, guardianReservationQueryKeys };

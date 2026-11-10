import {
  getGuardianReservation,
  getGuardianReservations,
  type ReservationPeriod,
  type ReservationScope,
} from '../api/guardianReservation';
import { toGuardianReservationDetail, toGuardianReservations } from '../model/guardianReservation';

const GUARDIAN_RESERVATION_KEY = 'guardian-reservation';

const guardianReservationQueryKeys = {
  all: [GUARDIAN_RESERVATION_KEY] as const,
  list: (petId: string, scope: ReservationScope, period?: ReservationPeriod) =>
    [GUARDIAN_RESERVATION_KEY, petId, scope, period ?? ''] as const,
  detail: (petId: string, reservationId: string) =>
    [GUARDIAN_RESERVATION_KEY, 'detail', petId, reservationId] as const,
};

const createReservationListOptions = (petId: string, scope: ReservationScope, period?: ReservationPeriod) => ({
  queryKey: guardianReservationQueryKeys.list(petId, scope, period),
  queryFn: () => getGuardianReservations({ petId, scope, period }),
  select: toGuardianReservations,
});

const createReservationDetailOptions = (petId: string, reservationId: string) => ({
  queryKey: guardianReservationQueryKeys.detail(petId, reservationId),
  queryFn: () => getGuardianReservation({ petId, reservationId }),
  select: toGuardianReservationDetail,
});

export { createReservationDetailOptions, createReservationListOptions, guardianReservationQueryKeys };

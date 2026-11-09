import { parseGuardianReservationList } from '../model/guardianReservation';

import { api } from '@shared/api';

const RESERVATION_SCOPE = {
  upcoming: 'UPCOMING',
  past: 'PAST',
} as const;

const RESERVATION_PERIOD = {
  one: 'ONE_MONTH',
  three: 'THREE_MONTHS',
  six: 'SIX_MONTHS',
} as const;

type ReservationScope = (typeof RESERVATION_SCOPE)[keyof typeof RESERVATION_SCOPE];
type ReservationPeriod = (typeof RESERVATION_PERIOD)[keyof typeof RESERVATION_PERIOD];

interface GetGuardianReservationsParams {
  petId: string;
  scope: ReservationScope;
  period?: ReservationPeriod;
}

/** `GET` - 보호자 내 예약 목록. 취소된 예약은 서버가 빼서 준다. */
const getGuardianReservations = async ({ petId, scope, period }: GetGuardianReservationsParams) => {
  const searchParams: Record<string, string> = { scope };
  if (scope === RESERVATION_SCOPE.past && period) searchParams.period = period;

  const response = await api
    .get(`guardian/pets/${encodeURIComponent(petId)}/reservations`, { searchParams })
    .json();

  return parseGuardianReservationList(response);
};

export { RESERVATION_PERIOD, RESERVATION_SCOPE, getGuardianReservations };
export type { GetGuardianReservationsParams, ReservationPeriod, ReservationScope };

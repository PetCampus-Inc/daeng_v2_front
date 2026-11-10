import {
  parseGuardianReservation,
  parseGuardianReservationDetail,
  parseGuardianReservationList,
  parseReservationResponse,
} from '../model/guardianReservation';

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

interface GuardianReservationCreate {
  ticketId: number;
  date: string;
  time: string;
  requestMemo: string | null;
}

interface PostGuardianReservationParams {
  petId: string;
  idempotencyKey: string;
  body: GuardianReservationCreate;
}

/** `POST` - 등원 예약 생성. 같은 Idempotency-Key 재시도는 최초 성공 응답 */
const postGuardianReservation = async ({ petId, idempotencyKey, body }: PostGuardianReservationParams) => {
  const response = await api
    .post(`guardian/pets/${encodeURIComponent(petId)}/reservations`, {
      json: body,
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    .json();

  return parseGuardianReservation(response);
};

/** `GET` - 보호자 예약 상세 */
const getGuardianReservation = async ({ petId, reservationId }: { petId: string; reservationId: string }) => {
  const response = await api
    .get(`guardian/pets/${encodeURIComponent(petId)}/reservations/${encodeURIComponent(reservationId)}`)
    .json();

  return parseGuardianReservationDetail(response);
};

/** `POST` - 등원 예약 취소. 취소된 예약 응답을 돌려준다. */
const cancelGuardianReservation = async ({ petId, reservationId }: { petId: string; reservationId: string }) => {
  const response = await api
    .post(`guardian/pets/${encodeURIComponent(petId)}/reservations/${encodeURIComponent(reservationId)}/cancel`)
    .json();

  return parseReservationResponse(response);
};

export {
  RESERVATION_PERIOD,
  RESERVATION_SCOPE,
  cancelGuardianReservation,
  getGuardianReservation,
  getGuardianReservations,
  postGuardianReservation,
};
export type { GetGuardianReservationsParams, GuardianReservationCreate, ReservationPeriod, ReservationScope };

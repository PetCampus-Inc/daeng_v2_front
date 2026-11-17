import {
  parseGuardianReservation,
  parseGuardianReservationDetail,
  parseGuardianReservationList,
  parseReservationResponse,
} from '../model/guardianReservation';
import { parseReservationCalendar, parseReservationSlots } from '../model/reservationSchedule';

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

interface GetReservationCalendarParams {
  petId: string;
  month: string;
  ticketId?: string;
}

/** `GET` - 월별 예약 달력. ticketId가 있으면 그 이용권 기준으로 선택 가능일을 판단한다. */
const getReservationCalendar = async ({ petId, month, ticketId }: GetReservationCalendarParams) => {
  const searchParams: Record<string, string> = { month };
  if (ticketId) searchParams.ticketId = ticketId;

  const response = await api
    .get(`guardian/pets/${encodeURIComponent(petId)}/reservations/calendar`, { searchParams })
    .json();

  return parseReservationCalendar(response);
};

interface GetReservationSlotsParams {
  petId: string;
  date: string;
  ticketId?: string;
}

/** `GET` - 날짜별 등원 시간. 예약할 수 없는 날이면 슬롯이 비어 있다. */
const getReservationSlots = async ({ petId, date, ticketId }: GetReservationSlotsParams) => {
  const searchParams: Record<string, string> = { date };
  if (ticketId) searchParams.ticketId = ticketId;

  const response = await api
    .get(`guardian/pets/${encodeURIComponent(petId)}/reservations/slots`, { searchParams })
    .json();

  return parseReservationSlots(response);
};

export {
  RESERVATION_PERIOD,
  RESERVATION_SCOPE,
  cancelGuardianReservation,
  getGuardianReservation,
  getGuardianReservations,
  getReservationCalendar,
  getReservationSlots,
  postGuardianReservation,
};
export type { GetGuardianReservationsParams, GuardianReservationCreate, ReservationPeriod, ReservationScope };

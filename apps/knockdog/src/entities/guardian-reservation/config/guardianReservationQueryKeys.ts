import {
  getGuardianReservation,
  getGuardianReservations,
  getReservationCalendar,
  getReservationSlots,
  type ReservationPeriod,
  type ReservationScope,
} from '../api/guardianReservation';
import { toGuardianReservationDetail, toGuardianReservations } from '../model/guardianReservation';
import { toReservationCalendar, toReservationSlots } from '../model/reservationSchedule';

const GUARDIAN_RESERVATION_KEY = 'guardian-reservation';

const guardianReservationQueryKeys = {
  all: [GUARDIAN_RESERVATION_KEY] as const,
  list: (petId: string, scope: ReservationScope, period?: ReservationPeriod) =>
    [GUARDIAN_RESERVATION_KEY, petId, scope, period ?? ''] as const,
  detail: (petId: string, reservationId: string) =>
    [GUARDIAN_RESERVATION_KEY, 'detail', petId, reservationId] as const,
  calendar: (petId: string, month: string, ticketId: string) =>
    [GUARDIAN_RESERVATION_KEY, 'calendar', petId, month, ticketId] as const,
  slots: (petId: string, date: string, ticketId: string) =>
    [GUARDIAN_RESERVATION_KEY, 'slots', petId, date, ticketId] as const,
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

const createCalendarOptions = (petId: string, month: string, ticketId: string) => ({
  queryKey: guardianReservationQueryKeys.calendar(petId, month, ticketId),
  queryFn: () => getReservationCalendar({ petId, month, ticketId: ticketId || undefined }),
  select: toReservationCalendar,
});

const createSlotsOptions = (petId: string, date: string, ticketId: string) => ({
  queryKey: guardianReservationQueryKeys.slots(petId, date, ticketId),
  queryFn: () => getReservationSlots({ petId, date, ticketId: ticketId || undefined }),
  select: toReservationSlots,
});

export {
  createCalendarOptions,
  createReservationDetailOptions,
  createReservationListOptions,
  createSlotsOptions,
  guardianReservationQueryKeys,
};

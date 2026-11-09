const NOTE_LIMIT = 200;
const WEEKDAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'] as const;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

const BOOKING_STATUS = {
  booked: 'booked',
  closed: 'closed',
} as const;

type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

interface VisitWhen {
  startsAt: string;
  placeName: string;
}

interface DayVisit {
  dogId: string;
  startsAt: string;
}

interface TicketUse {
  ticketId: string;
}

function clipNote(value: string) {
  return value.slice(0, NOTE_LIMIT);
}

function isNoteFilled(note: string) {
  return note.trim().length > 0;
}

function remainingAfterUses(remainingCount: number, useCount: number) {
  return Math.max(remainingCount - useCount, 0);
}

function remainingAfterUse(remainingCount: number, usedBefore: number) {
  return remainingAfterUses(remainingCount, usedBefore + 1);
}

function hasTicketLeft(remainingCount: number, usedBefore: number) {
  return remainingCount - usedBefore > 0;
}

function formatConfirmDate(date: Date) {
  const weekday = WEEKDAY_SHORT[date.getDay()] ?? '';
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
}

function formatTicketUse(totalCount: number) {
  return `${totalCount}회권 1회 사용`;
}

function formatRemainingCount(count: number) {
  return `잔여 ${count}회`;
}

function toVisitStartsAt(dateKey: string, minutes: number) {
  const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
  const minute = String(minutes % 60).padStart(2, '0');
  return `${dateKey}T${hour}:${minute}`;
}

function readReserveQuery(date: string | null, minutes: string | null) {
  if (!date || !DATE_KEY.test(date)) return null;
  const value = Number(minutes);
  if (!Number.isInteger(value) || value < 0 || value >= 24 * 60) return null;
  return { dateKey: date, minutes: value };
}

function isSameDayTaken(visits: readonly DayVisit[], dogId: string, dateKey: string) {
  return visits.some((visit) => visit.dogId === dogId && visit.startsAt.slice(0, 10) === dateKey);
}

function countTicketUses(visits: readonly TicketUse[], ticketId: string) {
  return visits.filter((visit) => visit.ticketId === ticketId).length;
}

function resolveBooking(input: {
  isBookable: boolean;
  remainingCount: number;
  usedBefore: number;
  isDayTaken: boolean;
}): BookingStatus {
  if (!input.isBookable || !hasTicketLeft(input.remainingCount, input.usedBefore) || input.isDayTaken) {
    return BOOKING_STATUS.closed;
  }
  return BOOKING_STATUS.booked;
}

function pickUpcoming(current: VisitWhen | null, visits: readonly VisitWhen[], nowKey: string) {
  const currentOk = current && current.startsAt >= nowKey ? current : null;
  const upcoming = visits.filter((visit) => visit.startsAt >= nowKey);
  const candidates = currentOk ? [currentOk, ...upcoming] : upcoming;
  if (candidates.length === 0) return null;

  return candidates.reduce((nearest, item) => (item.startsAt < nearest.startsAt ? item : nearest));
}

export {
  BOOKING_STATUS,
  NOTE_LIMIT,
  clipNote,
  countTicketUses,
  formatConfirmDate,
  formatRemainingCount,
  formatTicketUse,
  hasTicketLeft,
  isNoteFilled,
  isSameDayTaken,
  pickUpcoming,
  readReserveQuery,
  remainingAfterUse,
  remainingAfterUses,
  resolveBooking,
  toVisitStartsAt,
};
export type { BookingStatus, VisitWhen };

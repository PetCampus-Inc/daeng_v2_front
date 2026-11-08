const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토'] as const;
const EXPIRING_BADGE_DAYS = 3;
const MS_PER_DAY = 86_400_000;

const TICKET_STATUS = {
  active: 'active',
  onHold: 'onHold',
  scheduled: 'scheduled',
  expired: 'expired',
} as const;

type TicketStatus = keyof typeof TICKET_STATUS;

const RESERVE_STEP = {
  hoursUnset: 'hoursUnset',
  dateTime: 'dateTime',
} as const;

type ReserveStep = keyof typeof RESERVE_STEP;

const TICKET_BADGE_STATUS = {
  active: 'active',
  soon: 'soon',
} as const;

type TicketBadgeStatus = keyof typeof TICKET_BADGE_STATUS;

interface TicketBadge {
  status: TicketBadgeStatus;
  label: string;
}

interface ReservationTicket {
  id: string;
  totalCount: number;
  remainingCount: number;
  endsOn: string | null;
  chargedAt: string;
  status: TicketStatus;
}

interface UpcomingReservation {
  startsAt: string;
  placeName: string;
}

interface ReservationDog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weightKg: number;
  hasAttendanceHours: boolean;
  upcoming: UpcomingReservation | null;
  tickets: ReservationTicket[];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function toDateTimeKey(date: Date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${toDateKey(date)}T${hour}:${minute}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function parseDateTimeKey(value: string) {
  const [datePart = '', timePart = '00:00'] = value.split('T');
  const [hour, minute] = timePart.split(':');
  const date = parseDateKey(datePart);
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date;
}

function daysUntil(endsOn: string, today: Date) {
  const end = startOfDay(parseDateKey(endsOn)).getTime();
  const start = startOfDay(today).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

function formatDogAge(age: number) {
  return `${age}살`;
}

function formatDogWeight(weightKg: number) {
  return `${weightKg}kg`;
}

function formatReservationWhen(startsAt: string) {
  const date = parseDateTimeKey(startsAt);
  const hour = date.getHours();
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const minute = String(date.getMinutes()).padStart(2, '0');
  const meridiem = hour < 12 ? '오전' : '오후';
  const weekday = WEEKDAY_LABEL[date.getDay()];

  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday}) ${meridiem} ${String(hour12).padStart(2, '0')}:${minute}`;
}

function formatTicketPeriod(endsOn: string | null) {
  if (!endsOn) return '이용 기간 무제한';
  const [year, month, day] = endsOn.split('-');
  return `${year}.${month}.${day}까지`;
}

function getTicketBadge(endsOn: string | null, today: Date): TicketBadge {
  if (!endsOn) return { status: TICKET_BADGE_STATUS.active, label: '사용 중' };

  const remainingDays = daysUntil(endsOn, today);
  if (remainingDays >= 0 && remainingDays <= EXPIRING_BADGE_DAYS) {
    return { status: TICKET_BADGE_STATUS.soon, label: `D-${remainingDays}` };
  }

  return { status: TICKET_BADGE_STATUS.active, label: '사용 중' };
}

function listUsableTickets(tickets: ReservationTicket[]) {
  return tickets
    .filter((ticket) => ticket.status === TICKET_STATUS.active)
    .sort((left, right) => left.chargedAt.localeCompare(right.chargedAt));
}

function resolveReserveStep(hasAttendanceHours: boolean): ReserveStep {
  return hasAttendanceHours ? RESERVE_STEP.dateTime : RESERVE_STEP.hoursUnset;
}

export {
  RESERVE_STEP,
  TICKET_BADGE_STATUS,
  TICKET_STATUS,
  addDays,
  formatDogAge,
  formatDogWeight,
  formatReservationWhen,
  formatTicketPeriod,
  getTicketBadge,
  listUsableTickets,
  resolveReserveStep,
  toDateKey,
  toDateTimeKey,
};
export type { ReservationDog, ReservationTicket, ReserveStep, TicketBadge, UpcomingReservation };

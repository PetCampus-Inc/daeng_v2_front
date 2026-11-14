import {
  formatHourClock,
  formatVisitDate,
  parseVisitKey,
  toVisitKey,
} from '@views/guardian-reservation-page/lib/visitClock';

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
  name: string;
  totalCount: number;
  remainingCount: number;
  startsOn: string;
  endsOn: string | null;
  chargedAt: string;
  status: TicketStatus;
}

interface UpcomingReservation {
  startsAt: string;
  placeName: string;
}

const KINDERGARTEN_LINK = {
  connected: 'connected',
  pending: 'pending',
  none: 'none',
} as const;

type KindergartenLink = keyof typeof KINDERGARTEN_LINK;

const RESERVATION_EMPTY = {
  noPass: 'noPass',
  pending: 'pending',
  unlinked: 'unlinked',
} as const;

type ReservationEmpty = keyof typeof RESERVATION_EMPTY;

interface ReservationKindergarten {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
}

interface ReservationDog {
  id: string;
  name: string;
  breed: string;
  age: number;
  weightKg: number;
  hasAttendanceHours: boolean;
  link: KindergartenLink;
  kindergarten: ReservationKindergarten | null;
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
  return toVisitKey(date);
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
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
  const date = parseVisitKey(startsAt);
  return `${formatVisitDate(date)} ${formatHourClock(date.getHours(), date.getMinutes(), true)}`;
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

const TICKET_SECTION = {
  active: 'active',
  inactive: 'inactive',
  expired: 'expired',
} as const;

type TicketSectionId = keyof typeof TICKET_SECTION;

const TICKET_SECTION_ORDER = [TICKET_SECTION.active, TICKET_SECTION.inactive, TICKET_SECTION.expired] as const;

interface ManageTicketCopy {
  periodLead?: string;
  period: string;
  count: string;
  total: string;
}

interface TicketSection {
  id: TicketSectionId;
  tickets: ReservationTicket[];
}

function toDotDate(value: string) {
  return value.split('-').join('.');
}

function formatTicketRange(startsOn: string, endsOn: string | null) {
  if (!endsOn) return '이용 기간 무제한';
  return `${toDotDate(startsOn)} ~ ${toDotDate(endsOn)}`;
}

function formatManageTicket(ticket: ReservationTicket): ManageTicketCopy {
  const count = `${ticket.remainingCount}회`;
  const bookable = `/ ${ticket.totalCount}회 예약 가능`;
  const isExpired = ticket.status === TICKET_STATUS.expired;
  const isUsedUp = isExpired && ticket.remainingCount === 0;

  if (isUsedUp) {
    return {
      period: ticket.endsOn ? `${toDotDate(ticket.endsOn)} 만료` : '만료',
      count,
      total: `/ ${ticket.totalCount}회`,
    };
  }

  if (isExpired) {
    return {
      period: ticket.endsOn ? `${toDotDate(ticket.endsOn)} 이용 기간 만료` : '이용 기간 만료',
      count,
      total: `/ ${ticket.totalCount}회 (기간 만료로 예약 불가)`,
    };
  }

  if (ticket.status === TICKET_STATUS.onHold) {
    return {
      periodLead: '홀딩 기간',
      period: formatTicketRange(ticket.startsOn, ticket.endsOn),
      count,
      total: bookable,
    };
  }

  return {
    period: formatTicketRange(ticket.startsOn, ticket.endsOn),
    count,
    total: bookable,
  };
}

function sectionOf(status: TicketStatus) {
  if (status === TICKET_STATUS.active) return TICKET_SECTION.active;
  if (status === TICKET_STATUS.onHold || status === TICKET_STATUS.scheduled) return TICKET_SECTION.inactive;
  return TICKET_SECTION.expired;
}

function groupManageTickets(tickets: ReservationTicket[]): TicketSection[] {
  const grouped: Record<TicketSectionId, ReservationTicket[]> = {
    active: [],
    inactive: [],
    expired: [],
  };

  for (const ticket of tickets) {
    grouped[sectionOf(ticket.status)].push(ticket);
  }

  return TICKET_SECTION_ORDER.flatMap((id) => {
    const sectionTickets = grouped[id].slice().sort((left, right) => left.chargedAt.localeCompare(right.chargedAt));
    return sectionTickets.length === 0 ? [] : [{ id, tickets: sectionTickets }];
  });
}

function resolveReservationEmpty(link: KindergartenLink, hasUpcoming: boolean, usableCount: number) {
  if (link === KINDERGARTEN_LINK.none) return RESERVATION_EMPTY.unlinked;
  if (link === KINDERGARTEN_LINK.pending) return RESERVATION_EMPTY.pending;
  if (!hasUpcoming && usableCount === 0) return RESERVATION_EMPTY.noPass;
  return null;
}

function toReservationKindergartenLink(status: string) {
  if (status === 'none' || status === 'disconnected') return KINDERGARTEN_LINK.none;
  if (status === 'pending') return KINDERGARTEN_LINK.pending;
  if (status === 'approved' || status === 'connected') return KINDERGARTEN_LINK.connected;
  return null;
}

export {
  KINDERGARTEN_LINK,
  RESERVATION_EMPTY,
  TICKET_SECTION,
  RESERVE_STEP,
  TICKET_BADGE_STATUS,
  TICKET_STATUS,
  addDays,
  formatDogAge,
  formatDogWeight,
  formatReservationWhen,
  formatManageTicket,
  formatTicketPeriod,
  getTicketBadge,
  groupManageTickets,
  listUsableTickets,
  resolveReservationEmpty,
  resolveReserveStep,
  toReservationKindergartenLink,
  toDateKey,
  toDateTimeKey,
};
export type {
  KindergartenLink,
  ReservationDog,
  ReservationEmpty,
  ReservationKindergarten,
  ReservationTicket,
  TicketSection,
  TicketSectionId,
  ReserveStep,
  TicketBadge,
  UpcomingReservation,
};

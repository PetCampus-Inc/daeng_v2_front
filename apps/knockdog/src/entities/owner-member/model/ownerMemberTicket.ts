const TICKET_STATUS = {
  active: 'active',
  scheduled: 'scheduled',
  onHold: 'onHold',
  expired: 'expired',
} as const;

type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

interface OwnerMemberTicket {
  id: string;
  name: string;
  status: Exclude<TicketStatus, 'expired'>;
  remainingCount: number;
  totalCount: number;
  startsOn: string;
  endsOn: string | null;
}

interface OwnerMemberTicketView {
  id: string;
  name: string;
  status: TicketStatus;
  remainingCount: number;
  totalCount: number;
  period: string;
  remainingDays: number | null;
}

const NO_END_DATE_LABEL = '만료 없음';

const DAY_MS = 86_400_000;

function toUtcDay(value: string) {
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function toTodayUtcDay(today: Date) {
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatDotDate(value: string) {
  const [year, month, day] = value.split('-');
  return `${year}.${month}.${day}`;
}

function isUsageExpired(ticket: OwnerMemberTicket, today: Date) {
  if (ticket.remainingCount <= 0) return true;
  if (ticket.endsOn == null) return false;

  return toUtcDay(ticket.endsOn) < toTodayUtcDay(today);
}

function toOwnerMemberTicketView(ticket: OwnerMemberTicket, today: Date): OwnerMemberTicketView {
  const isExpired = isUsageExpired(ticket, today);
  const status = isExpired ? TICKET_STATUS.expired : ticket.status;
  const endLabel = ticket.endsOn == null ? NO_END_DATE_LABEL : formatDotDate(ticket.endsOn);
  const remainingDays =
    isExpired || ticket.endsOn == null ? null : (toUtcDay(ticket.endsOn) - toTodayUtcDay(today)) / DAY_MS;

  return {
    id: ticket.id,
    name: ticket.name,
    status,
    remainingCount: ticket.remainingCount,
    totalCount: ticket.totalCount,
    period: `${formatDotDate(ticket.startsOn)} ~ ${endLabel}`,
    remainingDays,
  };
}

export { NO_END_DATE_LABEL, TICKET_STATUS, toOwnerMemberTicketView };
export type { OwnerMemberTicket, OwnerMemberTicketView, TicketStatus };

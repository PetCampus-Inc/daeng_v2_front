const TICKET_LIST_STATUS = {
  active: 'active',
  scheduled: 'scheduled',
  onHold: 'onHold',
  expired: 'expired',
} as const;

type TicketListStatus = (typeof TICKET_LIST_STATUS)[keyof typeof TICKET_LIST_STATUS];
type TicketListFilter = 'all' | TicketListStatus;

interface MemberTicketListItem {
  id: string;
  name: string;
  status: Exclude<TicketListStatus, 'expired'>;
  remainingCount: number;
  totalCount: number;
  startsOn: string;
  endsOn: string | null;
  registeredAt: string;
}

interface TicketListCountable {
  status: TicketListStatus;
}

const TICKET_LIST_FILTERS = [
  { id: 'all', label: '전체' },
  { id: TICKET_LIST_STATUS.active, label: '사용중' },
  { id: TICKET_LIST_STATUS.scheduled, label: '사용예정' },
  { id: TICKET_LIST_STATUS.onHold, label: '홀딩중' },
  { id: TICKET_LIST_STATUS.expired, label: '만료' },
] as const satisfies ReadonlyArray<{ id: TicketListFilter; label: string }>;

function sortMemberTicketList(tickets: MemberTicketListItem[]) {
  return [...tickets].sort((left, right) => left.registeredAt.localeCompare(right.registeredAt));
}

function countTicketList(tickets: TicketListCountable[]) {
  const counts: Record<TicketListFilter, number> = {
    all: tickets.length,
    active: 0,
    scheduled: 0,
    onHold: 0,
    expired: 0,
  };

  for (const ticket of tickets) counts[ticket.status] += 1;

  return counts;
}

function filterTicketList<Ticket extends TicketListCountable>(tickets: Ticket[], filter: TicketListFilter) {
  if (filter === 'all') return tickets;
  return tickets.filter((ticket) => ticket.status === filter);
}

export { TICKET_LIST_FILTERS, TICKET_LIST_STATUS, countTicketList, filterTicketList, sortMemberTicketList };
export type { MemberTicketListItem, TicketListFilter, TicketListStatus };

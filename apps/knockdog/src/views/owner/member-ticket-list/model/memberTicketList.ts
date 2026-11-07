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

/** 목록 시안. 등록일시 오름차순이면 프레임 카드 순서가 된다. */
const MOCK_MEMBER_TICKET_LIST: MemberTicketListItem[] = [
  {
    id: 'trial',
    name: '체험권',
    status: TICKET_LIST_STATUS.active,
    remainingCount: 3,
    totalCount: 10,
    startsOn: '2026-08-01',
    endsOn: '2026-11-30',
    registeredAt: '2026-08-01T09:00:00',
  },
  {
    id: 'trial-1',
    name: '체험권 1',
    status: TICKET_LIST_STATUS.scheduled,
    remainingCount: 10,
    totalCount: 10,
    startsOn: '2026-08-01',
    endsOn: '2026-11-30',
    registeredAt: '2026-08-02T09:00:00',
  },
  {
    id: 'trial-2',
    name: '체험권 2',
    status: TICKET_LIST_STATUS.onHold,
    remainingCount: 10,
    totalCount: 10,
    startsOn: '2026-08-01',
    endsOn: '2026-11-30',
    registeredAt: '2026-08-03T09:00:00',
  },
  {
    id: 'open',
    name: '자유 10회권',
    status: TICKET_LIST_STATUS.scheduled,
    remainingCount: 0,
    totalCount: 10,
    startsOn: '2026-08-01',
    endsOn: '2026-08-30',
    registeredAt: '2026-08-04T09:00:00',
  },
];

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

export {
  MOCK_MEMBER_TICKET_LIST,
  TICKET_LIST_FILTERS,
  TICKET_LIST_STATUS,
  countTicketList,
  filterTicketList,
  sortMemberTicketList,
};
export type { MemberTicketListItem, TicketListFilter, TicketListStatus };

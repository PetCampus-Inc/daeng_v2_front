import { TICKET_STATUS, type OwnerMemberTicket } from '@entities/owner-member';

/** 이용권 API가 연결되기 전 프로필 시안. 빈 배열이면 빈 상태 카드를 보여 준다. */
const MOCK_OWNER_MEMBER_TICKETS: OwnerMemberTicket[] = [
  {
    id: 'trial',
    name: '체험권',
    status: TICKET_STATUS.active,
    remainingCount: 3,
    totalCount: 10,
    startsOn: '2026-08-01',
    endsOn: '2026-11-30',
  },
  {
    id: 'open',
    name: '자유 10회권',
    status: TICKET_STATUS.scheduled,
    remainingCount: 10,
    totalCount: 10,
    startsOn: '2026-08-01',
    endsOn: null,
  },
];

export { MOCK_OWNER_MEMBER_TICKETS };

import { describe, expect, it } from 'vitest';

import {
  TICKET_LIST_STATUS,
  countTicketList,
  filterTicketList,
  sortMemberTicketList,
  type MemberTicketListItem,
  type TicketListStatus,
} from './memberTicketList';

describe('memberTicketList', () => {
  it('등록일시 오름차순으로 정렬한다', () => {
    const later: MemberTicketListItem = {
      id: 'later',
      name: '나중',
      status: TICKET_LIST_STATUS.active,
      remainingCount: 1,
      totalCount: 10,
      startsOn: '2026-08-01',
      endsOn: null,
      registeredAt: '2026-09-01T00:00:00',
    };
    const earlier: MemberTicketListItem = { ...later, id: 'earlier', registeredAt: '2026-08-01T00:00:00' };

    expect(sortMemberTicketList([later, earlier]).map((ticket) => ticket.id)).toEqual(['earlier', 'later']);
  });

  it('상태별 개수를 세고 선택한 상태만 남긴다', () => {
    const tickets: Array<{ id: string; status: TicketListStatus }> = [
      { id: 'a', status: TICKET_LIST_STATUS.active },
      { id: 'b', status: TICKET_LIST_STATUS.expired },
    ];

    expect(countTicketList(tickets)).toMatchObject({ all: 2, active: 1, expired: 1, onHold: 0 });
    expect(filterTicketList(tickets, TICKET_LIST_STATUS.active).map((ticket) => ticket.id)).toEqual(['a']);
    expect(filterTicketList(tickets, 'all')).toHaveLength(2);
  });
});

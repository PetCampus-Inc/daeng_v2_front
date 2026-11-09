import { describe, expect, it } from 'vitest';

import { parsePetTicketList, toPetTicketList } from './petTicket';

const response = {
  data: {
    counts: { all: 2, inUse: 1, scheduled: 0, holding: 0, expired: 1 },
    tickets: [
      {
        ticketId: 1,
        name: '정기권 10회',
        status: 'IN_USE',
        remainingCount: 3,
        chargeCount: 10,
        startDate: '2026-08-01',
        expiresOn: '2026-11-30',
        daysLeft: 20,
      },
      {
        ticketId: 2,
        name: '자유 10회권',
        status: 'EXPIRED',
        remainingCount: 0,
        chargeCount: 10,
        startDate: '2026-08-01',
        expiresOn: null,
        daysLeft: null,
      },
    ],
  },
};

describe('toPetTicketList', () => {
  it('서버 상태와 개수를 카드에 맞는 값으로 바꾼다', () => {
    const list = toPetTicketList(parsePetTicketList(response));

    expect(list.counts).toEqual({ all: 2, active: 1, scheduled: 0, onHold: 0, expired: 1 });
    expect(list.tickets[0]).toMatchObject({
      id: '1',
      status: 'active',
      totalCount: 10,
      period: '2026.08.01 ~ 2026.11.30',
      remainingDays: 20,
    });
    expect(list.tickets[1]).toMatchObject({
      id: '2',
      status: 'expired',
      period: '2026.08.01 ~ 만료 없음',
      remainingDays: null,
    });
  });
});

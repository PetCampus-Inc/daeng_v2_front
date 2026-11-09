import { describe, expect, it } from 'vitest';

import { parsePetTicketDetail, parsePetTicketHistory, parsePetTicketList, toPetTicketDetail, toPetTicketHistory, toPetTicketList } from './petTicket';

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

describe('parsePetTicketList', () => {
  it('null 만료일은 유지하고 슬래시 날짜는 응답 오류로 본다', () => {
    expect(parsePetTicketList(response).tickets[1]?.expiresOn).toBeNull();
    expect(() =>
      parsePetTicketList({
        data: {
          ...response.data,
          tickets: [{ ...response.data.tickets[0], expiresOn: '2026/11/30' }],
        },
      })
    ).toThrow();
  });
});

describe('toPetTicketList', () => {
  it('Jackson 날짜 배열과 빠진 만료일도 목록으로 만든다', () => {
    const list = toPetTicketList(
      parsePetTicketList({
        data: {
          counts: { all: 1, inUse: 1, scheduled: 0, holding: 0, expired: 0 },
          tickets: [
            {
              ticketId: 3,
              name: '자유 10회권',
              status: 'IN_USE',
              remainingCount: 10,
              chargeCount: 10,
              startDate: [2026, 8, 1],
            },
          ],
        },
      })
    );

    expect(list.tickets[0]).toMatchObject({
      id: '3',
      period: '2026.08.01 ~ 만료 없음',
      remainingDays: null,
    });
  });

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

describe('toPetTicketHistory', () => {
  it('사용 취소는 취소선이고 홀딩과 충전은 화면 문구로 바꾼다', () => {
    const history = toPetTicketHistory(
      parsePetTicketHistory({
        data: {
          items: [
            {
              historyId: null,
              type: 'USE',
              occurredOn: [2026, 9, 10],
              reservedForDate: [2026, 9, 10],
              remainingAfter: 8,
              canceledOn: [2026, 9, 11],
            },
            {
              historyId: 2,
              type: 'HOLD',
              occurredOn: '2026-09-30',
              holdStartDate: [2026, 9, 30],
              holdEndDate: [2026, 10, 30],
            },
            { historyId: 1, type: 'CHARGE', occurredOn: '2026-09-01' },
          ],
        },
      })
    );

    expect(history).toEqual([
      { id: 'USE-2026.09.10-0', title: '사용(8회)', detail: '2026.09.10 예약취소', isCancelled: true },
      { id: '2', title: '홀딩', detail: '기간 2026.09.30 ~ 2026.10.30', isCancelled: false },
      { id: '1', title: '충전', detail: '2026.09.01', isCancelled: false },
    ]);
  });
});

describe('toPetTicketDetail', () => {
  it('상세의 날짜 배열과 홀딩 버튼을 화면 값으로 바꾼다', () => {
    const detail = toPetTicketDetail(
      parsePetTicketDetail({
        data: {
          ticketId: 1,
          name: '정기권 10회',
          status: 'HOLDING',
          remainingCount: 8,
          chargeCount: 10,
          startDate: [2026, 9, 1],
          chargedOn: [2026, 9, 1],
          expiresOn: [2026, 12, 4],
          daysLeft: 41,
          hold: {
            holdId: 4,
            startDate: [2026, 10, 30],
            endDate: [2026, 11, 10],
            phase: 'IN_PROGRESS',
          },
          holdButton: { type: 'CANCEL_HOLD', disabledReason: null, availableFrom: null },
        },
      })
    );

    expect(detail).toMatchObject({
      id: '1',
      status: 'onHold',
      startsOn: '2026.09.01',
      endsOn: '2026.12.04',
      chargedOn: '2026.09.01',
      remainingDays: 41,
      holdAction: 'cancel',
      hold: { startsOn: '2026.10.30', endsOn: '2026.11.10', phase: 'IN_PROGRESS' },
    });
  });
});

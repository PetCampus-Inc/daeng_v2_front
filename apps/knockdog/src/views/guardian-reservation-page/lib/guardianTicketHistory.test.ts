import { describe, expect, it } from 'vitest';

import {
  HISTORY_KIND,
  formatHistoryEntry,
  groupTicketHistory,
  visibleTickets,
  type TicketHistory,
} from './guardianTicketHistory';
import { TICKET_STATUS, type ReservationTicket } from './guardianReservationMain';

function createEntry(overrides: Partial<TicketHistory> = {}): TicketHistory {
  return {
    id: 'entry',
    occurredAt: '2026-08-01T10:00:00',
    kind: HISTORY_KIND.charge,
    count: 10,
    remainingCount: 10,
    detailOn: '2026-08-01',
    isVoided: false,
    ...overrides,
  };
}

const ticket: ReservationTicket = {
  id: 'soon-pass',
  name: '왈왈컹컹 유치원 10회권',
  totalCount: 10,
  remainingCount: 2,
  startsOn: '2026-08-01',
  endsOn: '2026-10-12',
  chargedAt: '2026-08-01T00:00:00',
  status: TICKET_STATUS.active,
};

describe('formatHistoryEntry', () => {
  it('내역 종류별 문구를 적는다', () => {
    expect(formatHistoryEntry(createEntry())).toEqual({
      title: '10회 충전',
      amount: '10회',
      description: '이용권 시작일: 2026.08.01',
      isVoided: false,
    });
    expect(
      formatHistoryEntry(createEntry({ kind: HISTORY_KIND.use, remainingCount: 7, detailOn: '2026-10-30' }))
    ).toMatchObject({
      title: '사용',
      amount: '7회',
      description: '2026.10.30. (금) 등원 예약',
    });
    expect(formatHistoryEntry(createEntry({ kind: HISTORY_KIND.cancel, remainingCount: 8 }))).toMatchObject({
      title: '사용 취소',
      description: '예약을 취소했어요',
    });
    expect(formatHistoryEntry(createEntry({ kind: HISTORY_KIND.hold, remainingCount: null, detailOn: '2026-11-25' })))
      .toMatchObject({
        title: '홀딩',
        amount: '-',
        description: '2026.11.25에 홀딩이 끝나요',
      });
    expect(formatHistoryEntry(createEntry({ kind: HISTORY_KIND.release, remainingCount: null }))).toMatchObject({
      title: '홀딩 해제',
      description: '이용권을 다시 쓸 수 있어요',
    });
    expect(
      formatHistoryEntry(createEntry({ kind: HISTORY_KIND.extend, remainingCount: null, detailOn: '2027-12-31' }))
    ).toMatchObject({
      title: '이용기간 연장',
      description: '2027.12.31까지 사용할 수 있어요',
    });
  });

  it('취소된 사용 내역만 취소선 대상이다', () => {
    expect(formatHistoryEntry(createEntry({ kind: HISTORY_KIND.use, isVoided: true })).isVoided).toBe(true);
    expect(formatHistoryEntry(createEntry({ kind: HISTORY_KIND.cancel })).isVoided).toBe(false);
  });
});

describe('groupTicketHistory', () => {
  it('날짜별로 묶고 같은 날 안에서도 최근 내역을 위에 둔다', () => {
    const groups = groupTicketHistory([
      createEntry({ id: 'charge', occurredAt: '2026-08-01T09:00:00' }),
      createEntry({ id: 'use', occurredAt: '2026-10-13T10:00:00', kind: HISTORY_KIND.use }),
      createEntry({ id: 'cancel', occurredAt: '2026-10-13T15:00:00', kind: HISTORY_KIND.cancel }),
    ]);

    expect(groups.map((group) => group.label)).toEqual(['10월 13일', '8월 1일']);
    expect(groups[0]?.entries.map((entry) => entry.id)).toEqual(['cancel', 'use']);
  });
});

describe('visibleTickets', () => {
  it('삭제한 이용권만 보호자 목록에서 뺀다', () => {
    expect(visibleTickets([ticket], []).map((item) => item.id)).toEqual(['soon-pass']);
    expect(visibleTickets([ticket], ['soon-pass'])).toEqual([]);
  });
});

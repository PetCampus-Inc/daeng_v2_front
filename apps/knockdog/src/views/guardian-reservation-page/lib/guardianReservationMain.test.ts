import { describe, expect, it } from 'vitest';

import {
  RESERVE_STEP,
  TICKET_BADGE_STATUS,
  TICKET_STATUS,
  formatReservationWhen,
  formatTicketPeriod,
  getTicketBadge,
  KINDERGARTEN_LINK,
  listUsableTickets,
  RESERVATION_EMPTY,
  resolveReservationEmpty,
  resolveReserveStep,
  type ReservationTicket,
} from './guardianReservationMain';

const today = new Date(2026, 9, 6);

function createTicket(overrides: Partial<ReservationTicket> = {}): ReservationTicket {
  return {
    id: 'ticket',
    totalCount: 10,
    remainingCount: 2,
    endsOn: '2026-10-13',
    chargedAt: '2026-08-13T00:00:00',
    status: TICKET_STATUS.active,
    ...overrides,
  };
}

describe('formatReservationWhen', () => {
  it('날짜를 오전·오후 시각으로 적는다', () => {
    expect(formatReservationWhen('2026-10-06T14:00')).toBe('10월 6일 (화) 오후 02:00');
    expect(formatReservationWhen('2026-10-06T09:05')).toBe('10월 6일 (화) 오전 09:05');
  });
});

describe('formatTicketPeriod', () => {
  it('만료일이 없으면 무제한으로 적는다', () => {
    expect(formatTicketPeriod(null)).toBe('이용 기간 무제한');
    expect(formatTicketPeriod('2026-10-13')).toBe('2026.10.13까지');
  });
});

describe('getTicketBadge', () => {
  it('만료 3일 전부터 D-n, 그 외에는 사용 중이다', () => {
    expect(getTicketBadge('2026-10-09', today)).toEqual({ status: TICKET_BADGE_STATUS.soon, label: 'D-3' });
    expect(getTicketBadge('2026-10-06', today)).toEqual({ status: TICKET_BADGE_STATUS.soon, label: 'D-0' });
    expect(getTicketBadge('2026-10-10', today)).toEqual({ status: TICKET_BADGE_STATUS.active, label: '사용 중' });
    expect(getTicketBadge(null, today)).toEqual({ status: TICKET_BADGE_STATUS.active, label: '사용 중' });
  });
});

describe('listUsableTickets', () => {
  it('사용 중만 먼저 충전한 순서로 남긴다', () => {
    const tickets = [
      createTicket({ id: 'later', chargedAt: '2026-09-01T00:00:00' }),
      createTicket({ id: 'held', status: TICKET_STATUS.onHold, chargedAt: '2026-07-01T00:00:00' }),
      createTicket({ id: 'earlier', chargedAt: '2026-08-01T00:00:00' }),
      createTicket({ id: 'planned', status: TICKET_STATUS.scheduled }),
      createTicket({ id: 'expired', status: TICKET_STATUS.expired }),
    ];

    expect(listUsableTickets(tickets).map((ticket) => ticket.id)).toEqual(['earlier', 'later']);
  });
});

describe('resolveReservationEmpty', () => {
  it('연결·예약·이용권이 없을 때만 빈 화면을 고른다', () => {
    expect(resolveReservationEmpty(KINDERGARTEN_LINK.none, false, 0)).toBe(RESERVATION_EMPTY.unlinked);
    expect(resolveReservationEmpty(KINDERGARTEN_LINK.pending, true, 2)).toBe(RESERVATION_EMPTY.pending);
    expect(resolveReservationEmpty(KINDERGARTEN_LINK.connected, false, 0)).toBe(RESERVATION_EMPTY.noPass);
    expect(resolveReservationEmpty(KINDERGARTEN_LINK.connected, true, 0)).toBeNull();
    expect(resolveReservationEmpty(KINDERGARTEN_LINK.connected, false, 1)).toBeNull();
  });
});

describe('resolveReserveStep', () => {
  it('등원 가능 시간이 없으면 안내 단계, 있으면 날짜 선택이다', () => {
    expect(resolveReserveStep(false)).toBe(RESERVE_STEP.hoursUnset);
    expect(resolveReserveStep(true)).toBe(RESERVE_STEP.dateTime);
  });
});

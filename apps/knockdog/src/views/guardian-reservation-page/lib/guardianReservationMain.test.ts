import { describe, expect, it } from 'vitest';

import { RESERVATION_HOURS_COPY } from '../config/guardianReservationHours';
import {
  RESERVE_STEP,
  TICKET_BADGE_STATUS,
  TICKET_SECTION,
  TICKET_STATUS,
  formatManageTicket,
  formatReservationWhen,
  formatTicketPeriod,
  getTicketBadge,
  groupManageTickets,
  KINDERGARTEN_LINK,
  listUsableTickets,
  pickUpcomingReservation,
  RESERVATION_EMPTY,
  resolveReservationEmpty,
  resolveReserveStep,
  toReservationKindergartenLink,
  type ReservationTicket,
} from './guardianReservationMain';

const today = new Date(2026, 9, 6);

function createTicket(overrides: Partial<ReservationTicket> = {}): ReservationTicket {
  return {
    id: 'ticket',
    name: '왈왈컹컹 유치원 10회권',
    totalCount: 10,
    remainingCount: 2,
    startsOn: '2026-08-13',
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

describe('formatManageTicket', () => {
  it('상태별 기간과 잔여 문구를 적는다', () => {
    expect(formatManageTicket(createTicket())).toEqual({
      period: '2026.08.13 ~ 2026.10.13',
      count: '2회',
      total: '/ 10회 예약 가능',
    });
    expect(
      formatManageTicket(createTicket({ status: TICKET_STATUS.onHold, startsOn: '2026-10-01', endsOn: '2026-10-31' }))
    ).toEqual({
      periodLead: '홀딩 기간',
      period: '2026.10.01 ~ 2026.10.31',
      count: '2회',
      total: '/ 10회 예약 가능',
    });
    expect(formatManageTicket(createTicket({ endsOn: null })).period).toBe('이용 기간 무제한');
    expect(
      formatManageTicket(
        createTicket({ status: TICKET_STATUS.expired, remainingCount: 0, totalCount: 1, endsOn: '2026-04-12' })
      )
    ).toEqual({
      period: '2026.04.12 소진',
      count: '0회',
      total: '/ 1회',
    });
    expect(
      formatManageTicket(
        createTicket({ status: TICKET_STATUS.expired, remainingCount: 2, totalCount: 5, endsOn: '2026-03-09' })
      )
    ).toEqual({
      period: '2026.03.09 이용 기간 만료',
      count: '2회',
      total: '/ 5회 (기간 만료로 예약 불가)',
    });
    expect(
      formatManageTicket(
        createTicket({
          status: TICKET_STATUS.expired,
          remainingCount: 0,
          endReason: 'periodEnded',
          endsOn: '2026-03-09',
        })
      ).period
    ).toBe('2026.03.09 이용 기간 만료');
  });
});

describe('groupManageTickets', () => {
  it('상태별로 묶고 빈 섹션은 빼며 먼저 충전한 순으로 둔다', () => {
    const sections = groupManageTickets([
      createTicket({ id: 'later', chargedAt: '2026-09-01T00:00:00' }),
      createTicket({ id: 'held', status: TICKET_STATUS.onHold, chargedAt: '2026-08-01T00:00:00' }),
      createTicket({ id: 'earlier', chargedAt: '2026-08-01T00:00:00' }),
      createTicket({ id: 'planned', status: TICKET_STATUS.scheduled, chargedAt: '2026-07-01T00:00:00' }),
      createTicket({ id: 'used', status: TICKET_STATUS.expired, chargedAt: '2026-02-01T00:00:00' }),
    ]);

    expect(sections.map((section) => section.id)).toEqual([
      TICKET_SECTION.active,
      TICKET_SECTION.inactive,
      TICKET_SECTION.expired,
    ]);
    expect(sections[0]?.tickets.map((ticket) => ticket.id)).toEqual(['earlier', 'later']);
    expect(sections[1]?.tickets.map((ticket) => ticket.id)).toEqual(['planned', 'held']);
    expect(groupManageTickets([]).map((section) => section.id)).toEqual([]);
  });
});

describe('pickUpcomingReservation', () => {
  const now = new Date(2026, 10, 14, 17, 30);

  it('등원 시각이 지난 예약은 처리 상태와 상관없이 빼고 다음 예약을 고른다', () => {
    const next = pickUpcomingReservation(
      [
        { id: 'past', startsAt: '2026-11-14T17:30', status: 'confirmed' },
        { id: 'later', startsAt: '2026-11-15T09:00', status: 'attended' },
        { id: 'sooner', startsAt: '2026-11-14T18:00', status: 'absent' },
      ],
      now
    );

    expect(next?.id).toBe('sooner');
    expect(
      pickUpcomingReservation([{ id: 'past', startsAt: '2026-11-14T17:30', status: 'confirmed' }], now)
    ).toBeNull();
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

describe('toReservationKindergartenLink', () => {
  it('미연결과 승인 대기, 연결됨만 예약 빈 화면으로 연결한다', () => {
    expect(toReservationKindergartenLink('none')).toBe(KINDERGARTEN_LINK.none);
    expect(toReservationKindergartenLink('disconnected')).toBe(KINDERGARTEN_LINK.none);
    expect(toReservationKindergartenLink('pending')).toBe(KINDERGARTEN_LINK.pending);
    expect(toReservationKindergartenLink('approved')).toBe(KINDERGARTEN_LINK.connected);
    expect(toReservationKindergartenLink('connected')).toBe(KINDERGARTEN_LINK.connected);
  });
});

describe('resolveReserveStep', () => {
  it('등원 가능 시간이 없으면 안내 단계, 있으면 날짜 선택이다', () => {
    expect(resolveReserveStep(false)).toBe(RESERVE_STEP.hoursUnset);
    expect(resolveReserveStep(true)).toBe(RESERVE_STEP.dateTime);
  });
});

describe('RESERVATION_HOURS_COPY', () => {
  it('원장이 시간을 열지 않은 안내 문구를 유지한다', () => {
    expect(RESERVATION_HOURS_COPY.title).toBe('날짜와 시간 선택');
    expect(RESERVATION_HOURS_COPY.heading).toBe('아직 예약 가능한 날이 열리지 않았어요');
    expect(RESERVATION_HOURS_COPY.body).toBe('궁금한 사항은 유치원에 문의해 주세요.');
    expect(RESERVATION_HOURS_COPY.action).toBe('예약하기');
  });
});

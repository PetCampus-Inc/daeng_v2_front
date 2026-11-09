import { describe, expect, it } from 'vitest';

import {
  BOOKING_STATUS,
  NOTE_LIMIT,
  clipNote,
  countTicketUses,
  formatConfirmDate,
  formatRemainingCount,
  formatTicketUse,
  hasTicketLeft,
  isNoteFilled,
  isSameDayTaken,
  pickUpcoming,
  readReserveQuery,
  remainingAfterUse,
  resolveBooking,
  toVisitStartsAt,
} from './guardianReservationConfirm';

describe('예약 메모', () => {
  it('비어 있으면 바로 나가고, 글자가 있으면 이탈을 물어본다', () => {
    expect(isNoteFilled('')).toBe(false);
    expect(isNoteFilled('   ')).toBe(false);
    expect(isNoteFilled('간식 알러지 있어요')).toBe(true);
  });

  it('200자를 넘기면 잘라 둔다', () => {
    expect(clipNote('가'.repeat(NOTE_LIMIT + 1))).toHaveLength(NOTE_LIMIT);
  });
});

describe('이용권 차감', () => {
  it('이번 예약 후 남은 횟수를 보여 주고 0 아래로 내려가지 않는다', () => {
    expect(remainingAfterUse(6, 0)).toBe(5);
    expect(remainingAfterUse(1, 0)).toBe(0);
    expect(remainingAfterUse(0, 0)).toBe(0);
    expect(hasTicketLeft(1, 1)).toBe(false);
  });

  it('같은 이용권의 확정만 사용 횟수로 센다', () => {
    const visits = [{ ticketId: 'soon-pass' }, { ticketId: 'active-pass' }, { ticketId: 'soon-pass' }];
    expect(countTicketUses(visits, 'soon-pass')).toBe(2);
  });
});

describe('예약 확정 판단', () => {
  it('열림 슬롯만 한 번 확정하고, 막힌 슬롯은 차감하지 않는다', () => {
    expect(resolveBooking({ isBookable: true, remainingCount: 2, usedBefore: 0, isDayTaken: false })).toBe(
      BOOKING_STATUS.booked
    );
    expect(resolveBooking({ isBookable: false, remainingCount: 2, usedBefore: 0, isDayTaken: false })).toBe(
      BOOKING_STATUS.closed
    );
    expect(resolveBooking({ isBookable: true, remainingCount: 2, usedBefore: 0, isDayTaken: true })).toBe(
      BOOKING_STATUS.closed
    );
  });

  it('같은 강아지의 같은 날은 한 건만 잡는다', () => {
    const visits = [{ dogId: 'chapchu', startsAt: '2026-10-08T17:00' }];
    expect(isSameDayTaken(visits, 'chapchu', '2026-10-08')).toBe(true);
    expect(isSameDayTaken(visits, 'chapchu', '2026-10-09')).toBe(false);
    expect(isSameDayTaken(visits, 'kong', '2026-10-08')).toBe(false);
  });
});

describe('확인 문구', () => {
  it('날짜, 이용권, 시간을 확인 화면 문구로 바꾼다', () => {
    expect(formatConfirmDate(new Date(2026, 9, 8))).toBe('10월 8일 (목)');
    expect(formatTicketUse(10)).toBe('10회권 1회 사용');
    expect(formatRemainingCount(5)).toBe('잔여 5회');
    expect(toVisitStartsAt('2026-10-08', 17 * 60)).toBe('2026-10-08T17:00');
    expect(readReserveQuery('2026-10-08', '1020')).toEqual({ dateKey: '2026-10-08', minutes: 1020 });
    expect(readReserveQuery('10월 8일', '1020')).toBeNull();
  });

  it('더 가까운 등원만 다가오는 예약으로 고른다', () => {
    const current = { startsAt: '2026-10-10T00:00', placeName: '기존' };
    const visit = { startsAt: '2026-10-08T17:00', placeName: '모모네 유치원' };

    expect(pickUpcoming(current, [visit], '2026-10-05T10:40')).toEqual(visit);
    expect(pickUpcoming(current, [], '2026-10-05T10:40')).toEqual(current);
    expect(pickUpcoming({ startsAt: '2026-10-01T00:00', placeName: '지난' }, [], '2026-10-05T10:40')).toBeNull();
  });
});

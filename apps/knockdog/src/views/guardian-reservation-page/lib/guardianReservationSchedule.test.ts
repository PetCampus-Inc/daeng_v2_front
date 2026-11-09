import { describe, expect, it } from 'vitest';

import {
  canContinueReserve,
  formatReserveClock,
  formatReserveDay,
  formatSelectedPass,
  listDisabledDates,
  listScheduleSlots,
} from './guardianReservationSchedule';

const now = new Date(2026, 9, 5, 10, 40);

describe('listScheduleSlots', () => {
  it('오늘 10:40에는 지난 시간과 정원 찬 시간만 막는다', () => {
    const slots = listScheduleSlots(now, now, false);
    const byLabel = Object.fromEntries(slots.map((slot) => [slot.label, slot.isDisabled]));

    expect(byLabel['07:00']).toBe(true);
    expect(byLabel['07:30']).toBe(true);
    expect(byLabel['10:30']).toBe(true);
    expect(byLabel['11:00']).toBe(false);
    expect(byLabel['05:00']).toBe(false);
  });

  it('예약된 날의 오후 1:30에 점을 찍는다', () => {
    const reserved = listScheduleSlots(new Date(2026, 9, 13), now, true).find((slot) => slot.label === '01:30');
    expect(reserved?.isReserved).toBe(true);
  });
});

describe('listDisabledDates', () => {
  it('지난 날, 일요일, 만료일 다음 날, 정원 마감일을 막는다', () => {
    const disabled = listDisabledDates(new Date(2026, 9, 1), now, now, '2026-10-13').map((date) => date.getDate());

    expect(disabled).toContain(4);
    expect(disabled).toContain(11);
    expect(disabled).not.toContain(13);
    expect(disabled).toContain(14);
    expect(disabled).toContain(9);
  });
});

describe('예약 요약', () => {
  it('날짜와 시간을 고르기 전에는 다음 단계가 막힌다', () => {
    expect(canContinueReserve(false, false)).toBe(false);
    expect(canContinueReserve(true, false)).toBe(false);
    expect(canContinueReserve(true, true)).toBe(true);
  });

  it('선택 요약을 화면 문구로 바꾼다', () => {
    expect(formatReserveDay(new Date(2026, 9, 13))).toBe('10월 13일 화요일');
    expect(formatReserveClock(17 * 60)).toBe('오후 5:00');
    expect(formatSelectedPass('왈왈컹컹 유치원', 10, 2)).toBe('왈왈컹컹 유치원 10회권 (2/10)');
  });
});

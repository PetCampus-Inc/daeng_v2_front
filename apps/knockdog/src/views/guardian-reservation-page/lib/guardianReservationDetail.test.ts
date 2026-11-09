import { describe, expect, it } from 'vitest';

import {
  canCancelReservation,
  formatCancelWhen,
  formatDeadlineLead,
  formatDetailClock,
  formatDetailDate,
} from './guardianReservationDetail';

const slot = '2026-11-03T09:00';

describe('예약 상세 취소 기한', () => {
  it('예약 시각 전까지만 취소할 수 있다', () => {
    expect(canCancelReservation(slot, new Date(2026, 10, 3, 8, 59))).toBe(true);
    expect(canCancelReservation(slot, new Date(2026, 10, 3, 9, 0))).toBe(false);
    expect(canCancelReservation(slot, new Date(2026, 10, 3, 9, 1))).toBe(false);
  });

  it('기한 안내는 예약 시각을 그대로 쓴다', () => {
    expect(formatDetailDate(slot)).toBe('11월 3일 (화)');
    expect(formatDetailClock(slot)).toBe('오전 9:00');
    expect(formatDeadlineLead(slot)).toBe('11월 3일 (화) 오전 9:00까지 ');
    expect(formatCancelWhen(slot)).toBe('11월 3일 (화) 오전 09:00');
  });

  it('오후 예약은 12시간제로 보여 준다', () => {
    expect(formatDetailClock('2026-11-03T17:00')).toBe('오후 5:00');
    expect(formatCancelWhen('2026-11-03T17:00')).toBe('11월 3일 (화) 오후 05:00');
  });
});

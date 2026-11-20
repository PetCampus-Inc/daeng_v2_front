import { describe, expect, test } from 'vitest';

import { toReservationScheduleLabel, toTicketExpiryLabel } from './formatGuardianDisconnectBlock';

describe('해제 불가 시트 — 이용권이 남은 경우', () => {
  test('이용권 만료일이 있으면 `yyyy.mm.dd까지` 형태로 만든다', () => {
    expect(toTicketExpiryLabel('2026-01-12')).toBe('2026.01.12까지');
  });

  test('이용권 만료일이 없으면 `만료 없음`으로 만든다', () => {
    expect(toTicketExpiryLabel(null)).toBe('만료 없음');
  });
});

describe('해제 불가 시트 — 예약이 남은 경우', () => {
  test('예약 날짜와 시간을 `yyyy.mm.dd 오전/오후 h:mm 등원 예정` 형태로 만든다', () => {
    expect(toReservationScheduleLabel('2026-10-12', '15:00')).toBe('2026.10.12 오후 3:00 등원 예정');
    expect(toReservationScheduleLabel('2026-10-12', '09:30')).toBe('2026.10.12 오전 9:30 등원 예정');
  });

  test('예약 시간이 없으면 날짜만 `yyyy.mm.dd 등원 예정` 형태로 만든다', () => {
    expect(toReservationScheduleLabel('2026-10-12', null)).toBe('2026.10.12 등원 예정');
  });

  test('예약 시간이 낮 12시면 `오후 12:00`, 자정 직후 0시대면 `오전 12:xx`로 만든다', () => {
    expect(toReservationScheduleLabel('2026-10-12', '12:00')).toBe('2026.10.12 오후 12:00 등원 예정');
    expect(toReservationScheduleLabel('2026-10-12', '00:30')).toBe('2026.10.12 오전 12:30 등원 예정');
  });
});

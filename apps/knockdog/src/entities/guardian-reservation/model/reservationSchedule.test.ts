import { describe, expect, it } from 'vitest';

import { parseReservationCalendar, parseReservationSlots, toReservationCalendar, toReservationSlots } from './reservationSchedule';

describe('reservation schedule mapper', () => {
  it('달력은 배열 날짜와 내 예약을 화면 모델로 바꾼다', () => {
    const calendar = toReservationCalendar(
      parseReservationCalendar({
        data: {
          reservable: true,
          unavailableReason: null,
          schoolId: 3,
          schoolName: '똑독 유치원',
          tickets: { usableRemainingCount: 8, nearestExpiresOn: [2026, 12, 31] },
          days: [
            {
              date: '2026-11-20',
              selectable: false,
              reason: 'FULL',
              reservationId: 11,
              reservationTime: '09:30:00',
            },
          ],
        },
      })
    );

    expect(calendar.schoolId).toBe('3');
    expect(calendar.nearestExpiresOn).toBe('2026-12-31');
    expect(calendar.days[0]).toEqual({
      date: '2026-11-20',
      isSelectable: false,
      reason: 'full',
      reservationId: '11',
      reservationTime: '09:30',
    });
  });

  it('슬래시 날짜는 거절한다', () => {
    expect(() =>
      parseReservationCalendar({
        data: {
          reservable: false,
          unavailableReason: 'NO_USABLE_TICKET',
          schoolId: null,
          schoolName: null,
          tickets: { usableRemainingCount: 0, nearestExpiresOn: null },
          days: [
            {
              date: '2026/11/20',
              selectable: false,
              reason: 'PAST',
              reservationId: null,
              reservationTime: null,
            },
          ],
        },
      })
    ).toThrow();
  });

  it('등원 시간은 초와 배열을 HH:mm과 분으로 바꾼다', () => {
    const slots = toReservationSlots(
      parseReservationSlots({
        data: {
          date: [2026, 11, 20],
          selectable: true,
          unavailableReason: null,
          reservationId: null,
          slots: [
            { time: '09:30:00', available: true },
            { time: [13, 30], available: false },
          ],
        },
      })
    );

    expect(slots.date).toBe('2026-11-20');
    expect(slots.slots).toEqual([
      { time: '09:30', minutes: 570, isAvailable: true },
      { time: '13:30', minutes: 810, isAvailable: false },
    ]);
  });
});

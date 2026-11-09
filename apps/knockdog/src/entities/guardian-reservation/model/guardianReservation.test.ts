import { describe, expect, it } from 'vitest';

import { parseGuardianReservationList, toGuardianReservations } from './guardianReservation';

const response = {
  data: {
    reservations: [
      {
        reservationId: 11,
        petId: 332,
        schoolId: 182,
        schoolName: '똑독 유치원',
        date: '2026-11-20',
        time: '09:30',
        status: 'CONFIRMED',
        ticketId: 7,
        ticketName: '10회권',
        ticketRemainingCount: 8,
        requestMemo: null,
        cancelableUntil: '2026-11-20T09:30:00',
        canceledAt: null,
      },
      {
        reservationId: 8,
        petId: 332,
        schoolId: 182,
        schoolName: '똑독 유치원',
        date: [2026, 11, 3],
        time: '17:00',
        status: 'ATTENDED',
        ticketId: 7,
        ticketName: '10회권',
        ticketRemainingCount: 9,
        requestMemo: '픽업',
        cancelableUntil: null,
        canceledAt: null,
      },
      {
        reservationId: 4,
        petId: 332,
        schoolId: 182,
        schoolName: '똑독 유치원',
        date: '2026-10-01',
        time: '09:00',
        status: 'CANCELED',
        ticketId: 7,
        ticketName: '10회권',
        ticketRemainingCount: 10,
        requestMemo: null,
        cancelableUntil: null,
        canceledAt: '2026-09-30T10:00:00',
      },
    ],
  },
};

describe('toGuardianReservations', () => {
  it('날짜 배열을 등원 시각으로 바꾸고 취소된 예약은 뺀다', () => {
    const reservations = toGuardianReservations(parseGuardianReservationList(response));

    expect(reservations).toEqual([
      { id: '11', petId: '332', startsAt: '2026-11-20T09:30', schoolName: '똑독 유치원', status: 'confirmed' },
      { id: '8', petId: '332', startsAt: '2026-11-03T17:00', schoolName: '똑독 유치원', status: 'attended' },
    ]);
  });

  it('슬래시 날짜는 응답 오류로 본다', () => {
    expect(() =>
      parseGuardianReservationList({
        data: {
          reservations: [{ ...response.data.reservations[0], date: '2026/11/20' }],
        },
      })
    ).toThrow();
  });
});

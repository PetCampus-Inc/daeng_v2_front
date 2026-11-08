import {
  TICKET_STATUS,
  addDays,
  toDateKey,
  toDateTimeKey,
  type ReservationDog,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';

function createReservationMainMock(today: Date): ReservationDog[] {
  const soon = toDateKey(addDays(today, 3));
  const later = toDateKey(addDays(today, 40));
  const upcomingAt = toDateTimeKey(addDays(today, 2));

  return [
    {
      id: 'chapchu',
      name: '찹츄',
      breed: '골든리트리버',
      age: 3,
      weightKg: 20,
      hasAttendanceHours: true,
      upcoming: { startsAt: upcomingAt, placeName: '왈왈컹컹 유치원' },
      tickets: [
        {
          id: 'soon-pass',
          totalCount: 10,
          remainingCount: 2,
          endsOn: soon,
          chargedAt: '2026-08-01T00:00:00',
          status: TICKET_STATUS.active,
        },
        {
          id: 'active-pass',
          totalCount: 10,
          remainingCount: 2,
          endsOn: later,
          chargedAt: '2026-08-13T00:00:00',
          status: TICKET_STATUS.active,
        },
        {
          id: 'held-pass',
          totalCount: 10,
          remainingCount: 4,
          endsOn: later,
          chargedAt: '2026-07-01T00:00:00',
          status: TICKET_STATUS.onHold,
        },
      ],
    },
    {
      id: 'kong',
      name: '콩이',
      breed: '말티즈',
      age: 2,
      weightKg: 3,
      hasAttendanceHours: false,
      upcoming: { startsAt: upcomingAt, placeName: '왈왈컹컹 유치원' },
      tickets: [],
    },
    {
      id: 'dubu',
      name: '두부',
      breed: '포메라니안',
      age: 7,
      weightKg: 3,
      hasAttendanceHours: true,
      upcoming: null,
      tickets: [
        {
          id: 'dubu-pass',
          totalCount: 10,
          remainingCount: 2,
          endsOn: null,
          chargedAt: '2026-09-01T00:00:00',
          status: TICKET_STATUS.active,
        },
      ],
    },
  ];
}

export { createReservationMainMock };

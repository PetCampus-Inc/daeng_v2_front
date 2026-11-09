import {
  KINDERGARTEN_LINK,
  TICKET_STATUS,
  addDays,
  toDateKey,
  toDateTimeKey,
  type ReservationDog,
  type ReservationKindergarten,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';

const MOMO_KINDERGARTEN: ReservationKindergarten = {
  placeId: 'momo',
  name: '모모네 유치원',
  address: '서울특별시 강남구 논현로 123길 37',
};

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
      link: KINDERGARTEN_LINK.connected,
      kindergarten: MOMO_KINDERGARTEN,
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
      link: KINDERGARTEN_LINK.connected,
      kindergarten: MOMO_KINDERGARTEN,
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
      link: KINDERGARTEN_LINK.connected,
      kindergarten: MOMO_KINDERGARTEN,
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
    {
      id: 'bori',
      name: '보리',
      breed: '웰시코기',
      age: 4,
      weightKg: 12,
      hasAttendanceHours: true,
      link: KINDERGARTEN_LINK.connected,
      kindergarten: MOMO_KINDERGARTEN,
      upcoming: null,
      tickets: [],
    },
    {
      id: 'choco',
      name: '초코',
      breed: '비글',
      age: 5,
      weightKg: 11,
      hasAttendanceHours: true,
      link: KINDERGARTEN_LINK.pending,
      kindergarten: MOMO_KINDERGARTEN,
      upcoming: null,
      tickets: [],
    },
    {
      id: 'haneul',
      name: '하늘',
      breed: '푸들',
      age: 1,
      weightKg: 4,
      hasAttendanceHours: true,
      link: KINDERGARTEN_LINK.none,
      kindergarten: null,
      upcoming: null,
      tickets: [],
    },
  ];
}

export { createReservationMainMock };

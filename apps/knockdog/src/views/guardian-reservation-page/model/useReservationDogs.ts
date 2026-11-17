'use client';

import { useMemo } from 'react';

import { createReservationMainMock } from '@views/guardian-reservation-page/config/guardianReservationMainMock';

function useReservationDogs() {
  const now = useMemo(() => new Date(), []);
  const dogs = useMemo(() => createReservationMainMock(now), [now]);
  return { now, dogs };
}

export { useReservationDogs };

'use client';

import { useSyncExternalStore } from 'react';

import { isSameDayTaken } from '@views/guardian-reservation-page/lib/guardianReservationConfirm';

interface BookedVisit {
  id: string;
  dogId: string;
  ticketId: string;
  startsAt: string;
  placeName: string;
  note: string;
  remainingCount: number;
}

let visits: readonly BookedVisit[] = [];
const listeners = new Set<() => void>();

function emitVisits() {
  listeners.forEach((listener) => listener());
}

function bookVisit(visit: BookedVisit) {
  if (isSameDayTaken(visits, visit.dogId, visit.startsAt.slice(0, 10))) return false;
  visits = [...visits, visit];
  emitVisits();
  return true;
}

function subscribeVisits(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getBookedVisits() {
  return visits;
}

function useBookedVisits() {
  return useSyncExternalStore(subscribeVisits, getBookedVisits, getBookedVisits);
}

export { bookVisit, useBookedVisits };
export type { BookedVisit };

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
  isCancelled: boolean;
}

let visits: readonly BookedVisit[] = [];
let cancelledIds: readonly string[] = [];
let cancelNotice: string | null = null;
const listeners = new Set<() => void>();

function emitVisits() {
  listeners.forEach((listener) => listener());
}

function bookVisit(visit: Omit<BookedVisit, 'isCancelled'>) {
  const active = visits.filter((item) => !item.isCancelled);
  if (isSameDayTaken(active, visit.dogId, visit.startsAt.slice(0, 10))) return false;
  visits = [...visits, { ...visit, isCancelled: false }];
  emitVisits();
  return true;
}

function cancelReservation(id: string) {
  if (cancelledIds.includes(id)) return false;
  cancelledIds = [...cancelledIds, id];
  visits = visits.map((visit) => (visit.id === id ? { ...visit, isCancelled: true } : visit));
  emitVisits();
  return true;
}

function publishCancelNotice(startsAt: string) {
  cancelNotice = startsAt;
  emitVisits();
}

function takeCancelNotice() {
  const current = cancelNotice;
  if (!current) return null;
  cancelNotice = null;
  emitVisits();
  return current;
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

function getCancelledIds() {
  return cancelledIds;
}

function getCancelNotice() {
  return cancelNotice;
}

function useBookedVisits() {
  return useSyncExternalStore(subscribeVisits, getBookedVisits, getBookedVisits);
}

function useCancelledIds() {
  return useSyncExternalStore(subscribeVisits, getCancelledIds, getCancelledIds);
}

function useCancelNotice() {
  return useSyncExternalStore(subscribeVisits, getCancelNotice, getCancelNotice);
}

export {
  bookVisit,
  cancelReservation,
  publishCancelNotice,
  takeCancelNotice,
  useBookedVisits,
  useCancelNotice,
  useCancelledIds,
};
export type { BookedVisit };

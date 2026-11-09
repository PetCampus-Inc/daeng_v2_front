'use client';

import { useSyncExternalStore } from 'react';

import { isSameDayTaken } from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import { STORAGE_KEYS } from '@shared/constants/storage';
import { safeLocalStorage } from '@shared/lib/storage';

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

const EMPTY_VISITS: readonly BookedVisit[] = [];
const EMPTY_IDS: readonly string[] = [];

let visits: readonly BookedVisit[] = EMPTY_VISITS;
let cancelledIds: readonly string[] = EMPTY_IDS;
let cancelNotice: string | null = null;
let isHydrated = false;
const listeners = new Set<() => void>();

function isBookedVisit(value: unknown): value is BookedVisit {
  if (!value || typeof value !== 'object') return false;
  const visit = value as BookedVisit;
  return (
    typeof visit.id === 'string' &&
    typeof visit.dogId === 'string' &&
    typeof visit.ticketId === 'string' &&
    typeof visit.startsAt === 'string' &&
    typeof visit.placeName === 'string' &&
    typeof visit.note === 'string' &&
    typeof visit.remainingCount === 'number' &&
    typeof visit.isCancelled === 'boolean'
  );
}

function readStored() {
  const raw = safeLocalStorage.get(STORAGE_KEYS.GUARDIAN_RESERVATION_BOOKINGS);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      visits?: unknown;
      cancelledIds?: unknown;
      cancelNotice?: unknown;
    };
    return {
      visits: Array.isArray(parsed.visits) ? parsed.visits.filter(isBookedVisit) : EMPTY_VISITS,
      cancelledIds: Array.isArray(parsed.cancelledIds)
        ? parsed.cancelledIds.filter((id): id is string => typeof id === 'string')
        : EMPTY_IDS,
      cancelNotice: typeof parsed.cancelNotice === 'string' ? parsed.cancelNotice : null,
    };
  } catch {
    return null;
  }
}

function persistBookings() {
  safeLocalStorage.set(
    STORAGE_KEYS.GUARDIAN_RESERVATION_BOOKINGS,
    JSON.stringify({ visits, cancelledIds, cancelNotice })
  );
}

function applyStored(stored: NonNullable<ReturnType<typeof readStored>>) {
  visits = stored.visits;
  cancelledIds = stored.cancelledIds;
  cancelNotice = stored.cancelNotice;
}

function hydrateBookings() {
  if (isHydrated || typeof window === 'undefined') return;
  isHydrated = true;
  const stored = readStored();
  if (stored) applyStored(stored);
}

function emitVisits() {
  listeners.forEach((listener) => listener());
}

function bookVisit(visit: Omit<BookedVisit, 'isCancelled'>) {
  hydrateBookings();
  const active = visits.filter((item) => !item.isCancelled);
  if (isSameDayTaken(active, visit.dogId, visit.startsAt.slice(0, 10))) return false;
  visits = [...visits, { ...visit, isCancelled: false }];
  persistBookings();
  emitVisits();
  return true;
}

function cancelReservation(id: string) {
  hydrateBookings();
  if (cancelledIds.includes(id)) return false;
  cancelledIds = [...cancelledIds, id];
  visits = visits.map((visit) => (visit.id === id ? { ...visit, isCancelled: true } : visit));
  persistBookings();
  emitVisits();
  return true;
}

function publishCancelNotice(startsAt: string) {
  hydrateBookings();
  cancelNotice = startsAt;
  persistBookings();
  emitVisits();
}

function takeCancelNotice() {
  hydrateBookings();
  const current = cancelNotice;
  if (!current) return null;
  cancelNotice = null;
  persistBookings();
  emitVisits();
  return current;
}

function subscribeVisits(listener: () => void) {
  hydrateBookings();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEYS.GUARDIAN_RESERVATION_BOOKINGS) return;
    const stored = event.newValue ? readStored() : null;
    visits = stored?.visits ?? EMPTY_VISITS;
    cancelledIds = stored?.cancelledIds ?? EMPTY_IDS;
    cancelNotice = stored?.cancelNotice ?? null;
    isHydrated = true;
    emitVisits();
  });
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

function getServerVisits() {
  return EMPTY_VISITS;
}

function getServerIds() {
  return EMPTY_IDS;
}

function getServerNotice() {
  return null;
}

function useBookedVisits() {
  return useSyncExternalStore(subscribeVisits, getBookedVisits, getServerVisits);
}

function useCancelledIds() {
  return useSyncExternalStore(subscribeVisits, getCancelledIds, getServerIds);
}

function useCancelNotice() {
  return useSyncExternalStore(subscribeVisits, getCancelNotice, getServerNotice);
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

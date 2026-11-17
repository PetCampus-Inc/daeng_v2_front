'use client';

import { useSyncExternalStore } from 'react';

let hiddenIds: readonly string[] = [];
const listeners = new Set<() => void>();

function hideGuardianTicket(ticketId: string) {
  if (hiddenIds.includes(ticketId)) return;
  hiddenIds = [...hiddenIds, ticketId];
  listeners.forEach((listener) => listener());
}

function subscribeHiddenTickets(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getHiddenTicketIds() {
  return hiddenIds;
}

function useHiddenTicketIds() {
  return useSyncExternalStore(subscribeHiddenTickets, getHiddenTicketIds, getHiddenTicketIds);
}

export { hideGuardianTicket, useHiddenTicketIds };

import type { ReservationDog } from '@views/guardian-reservation-page/lib/guardianReservationMain';
import type { TicketHistory } from '@views/guardian-reservation-page/lib/guardianTicketHistory';

function createReservationMainMock(_today: Date): ReservationDog[] {
  return [];
}

function findTicketHistory(_ticketId: string): TicketHistory[] | null {
  return null;
}

export { createReservationMainMock, findTicketHistory };

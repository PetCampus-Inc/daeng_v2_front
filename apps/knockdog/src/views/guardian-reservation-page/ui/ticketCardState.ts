import { MEMBERSHIP_CARD_STATE } from '@knockdog/ui';

import { TICKET_STATUS, type ReservationTicket } from '@views/guardian-reservation-page/lib/guardianReservationMain';

function toCardState(status: ReservationTicket['status']) {
  if (status === TICKET_STATUS.onHold) return MEMBERSHIP_CARD_STATE.onHold;
  if (status === TICKET_STATUS.scheduled) return MEMBERSHIP_CARD_STATE.scheduled;
  if (status === TICKET_STATUS.expired) return MEMBERSHIP_CARD_STATE.expired;
  return MEMBERSHIP_CARD_STATE.active;
}

export { toCardState };

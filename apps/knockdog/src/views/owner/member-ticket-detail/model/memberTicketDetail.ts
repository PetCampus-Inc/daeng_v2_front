import type { TicketHoldPlan } from '@views/owner/member-ticket-detail/model/memberTicketHold';import type { PetTicketDetail } from '@entities/owner-pet-ticket';
import { TICKET_STATUS, type TicketStatus } from '@entities/owner-member';

interface TicketHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface TicketDetail {
  id: string;
  name: string;
  status: TicketStatus;
  remainingCount: number;
  totalCount: number;
  startsOn: string;
  endsOn: string | null;
  chargedOn: string;
  remainingDays: number | null;
  history: TicketHistoryLine[];
  hold: TicketHoldPlan | null;
  holdAction: 'hold' | 'cancel' | 'disabled';
}

function toTicketDetail(ticket: PetTicketDetail): TicketDetail {
  const statusBefore = ticket.status === TICKET_STATUS.onHold ? TICKET_STATUS.active : ticket.status;

  return {
    id: ticket.id,
    name: ticket.name,
    status: ticket.status,
    remainingCount: ticket.remainingCount,
    totalCount: ticket.totalCount,
    startsOn: ticket.startsOn,
    endsOn: ticket.endsOn,
    chargedOn: ticket.chargedOn,
    remainingDays: ticket.remainingDays,
    history: [],
    hold: ticket.hold
      ? { startsOn: ticket.hold.startsOn, endsOn: ticket.hold.endsOn, statusBefore }
      : null,
    holdAction: ticket.holdAction,
  };
}

export { toTicketDetail };
export type { TicketDetail, TicketHistoryLine };

import { addDotDays, daysBetweenDotDates, formatTicketDotDate } from './memberTicketDate';

interface HoldHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface TicketHoldPlan {
  startsOn: string;
  endsOn: string;
  statusBefore: string;
}

interface HoldableTicket {
  status: string;
  endsOn: string | null;
  remainingDays: number | null;
  history: HoldHistoryLine[];
  hold: TicketHoldPlan | null;
}

function canConfirmHold(startsOn: string | null, endsOn: string | null) {
  if (startsOn == null || endsOn == null) return false;
  return endsOn >= startsOn;
}

function applyTicketHold<Ticket extends HoldableTicket>(ticket: Ticket, startsOn: string, endsOn: string, today: Date): Ticket {
  const isStarted = startsOn <= formatTicketDotDate(today);

  return {
    ...ticket,
    status: isStarted ? 'onHold' : ticket.status,
    hold: { startsOn, endsOn, statusBefore: ticket.status },
    history: [
      {
        id: `hold-${startsOn}-${endsOn}`,
        title: '홀딩',
        detail: `기간 ${startsOn} ~ ${endsOn}`,
        isCancelled: false,
      },
      ...ticket.history,
    ],
  };
}

function cancelTicketHold<Ticket extends HoldableTicket>(ticket: Ticket, today: Date): Ticket {
  const plan = ticket.hold;
  if (!plan) return ticket;

  const todayLabel = formatTicketDotDate(today);
  const heldDays = plan.startsOn < todayLabel ? daysBetweenDotDates(plan.startsOn, todayLabel) : 0;
  const releaseOn = heldDays === 0 ? todayLabel : addDotDays(todayLabel, -1);

  return {
    ...ticket,
    status: plan.statusBefore as Ticket['status'],
    endsOn: ticket.endsOn == null || heldDays === 0 ? ticket.endsOn : addDotDays(ticket.endsOn, heldDays),
    remainingDays: ticket.remainingDays == null ? null : ticket.remainingDays + heldDays,
    hold: null,
    history: [
      {
        id: `hold-end-${releaseOn}`,
        title: '홀딩 해제',
        detail: `기간 ${releaseOn}`,
        isCancelled: false,
      },
      ...ticket.history,
    ],
  };
}

export { applyTicketHold, canConfirmHold, cancelTicketHold };
export { formatTicketDotDate as formatHoldDotDate, formatTicketSelectLabel as formatHoldSelectLabel, startOfTicketDay as startOfHoldDay } from './memberTicketDate';
export type { HoldableTicket, HoldHistoryLine, TicketHoldPlan };

import { formatTicketDotDate } from './memberTicketDate';

interface HoldHistoryLine {
  id: string;
  title: string;
  detail: string;
  isCancelled: boolean;
}

interface HoldableTicket {
  status: string;
  history: HoldHistoryLine[];
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

export { applyTicketHold, canConfirmHold };
export { formatTicketDotDate as formatHoldDotDate, formatTicketSelectLabel as formatHoldSelectLabel, startOfTicketDay as startOfHoldDay } from './memberTicketDate';
export type { HoldableTicket, HoldHistoryLine };

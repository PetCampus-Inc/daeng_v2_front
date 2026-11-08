import { cn } from '@knockdog/ui/lib';

const DISCONNECT_TICKET = {
  pass: 'pass',
  reservation: 'reservation',
} as const;

type DisconnectTicketKind = keyof typeof DISCONNECT_TICKET;

const DISCONNECT_TICKET_COPY = {
  pass: {
    title: '모모네 유치원 10회권',
    description: '2026.01.12까지',
    amount: '6회 남음',
  },
  reservation: {
    title: '모모네 유치원 예약',
    description: '2026.10.12 오후 3:00 등원 예정',
    amount: '등원 전',
  },
} as const;

interface DisconnectTicketProps {
  kind?: DisconnectTicketKind;
  title?: string;
  description?: string;
  amount?: string;
  className?: string;
}

/** V4 / Bottom Sheet / Disconnect Ticket */
function DisconnectTicket({ kind = 'pass', title, description, amount, className }: DisconnectTicketProps) {
  const copy = DISCONNECT_TICKET_COPY[kind];

  return (
    <div className={cn('bg-bg-50 radius-r3 px-x4 py-x3_5 flex w-full items-center justify-between gap-x2', className)}>
      <div className='gap-x0_5 flex min-w-0 flex-col'>
        <p className='body1-extrabold text-text-primary'>{title ?? copy.title}</p>
        <p className='body2-semibold text-text-secondary'>{description ?? copy.description}</p>
      </div>
      <p className='body2-bold text-text-accent shrink-0'>{amount ?? copy.amount}</p>
    </div>
  );
}

export { DisconnectTicket, DISCONNECT_TICKET };
export type { DisconnectTicketKind, DisconnectTicketProps };

import { ChargeButton, TicketEmptyCard, TicketSectionLink, TicketSummaryCard } from '@knockdog/ui';

import { MOCK_OWNER_MEMBER_TICKETS, toOwnerMemberTicketView } from '../model/ownerMemberTicket';

function OwnerMemberTicketSection() {
  const tickets = MOCK_OWNER_MEMBER_TICKETS.map((ticket) => toOwnerMemberTicketView(ticket, new Date()));

  return (
    <section className='flex flex-col gap-4 px-4 pt-9 pb-4'>
      <div className='flex items-center justify-between px-1'>
        <TicketSectionLink />
        <ChargeButton />
      </div>
      {tickets.length === 0 ? (
        <TicketEmptyCard />
      ) : (
        tickets.map((ticket) => (
          <TicketSummaryCard
            key={ticket.id}
            title={ticket.name}
            status={ticket.status}
            remainingCount={ticket.remainingCount}
            totalCount={ticket.totalCount}
            period={ticket.period}
            remainingDays={ticket.remainingDays ?? undefined}
          />
        ))
      )}
    </section>
  );
}

export { OwnerMemberTicketSection };

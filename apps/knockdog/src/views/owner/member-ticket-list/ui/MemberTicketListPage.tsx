'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { ChargeButton, StatusFilterChip, TicketSummaryCard } from '@knockdog/ui';

import { memberTicketListContent } from '@views/owner/member-ticket-list/config/memberTicketListContent';
import {
  MOCK_MEMBER_TICKET_LIST,
  TICKET_LIST_FILTERS,
  countTicketList,
  filterTicketList,
  sortMemberTicketList,
  type TicketListFilter,
} from '@views/owner/member-ticket-list/model/memberTicketList';

import { MemberTicketListEmpty } from '@views/owner/member-ticket-list/ui/MemberTicketListEmpty';

import { Header } from '@widgets/Header';

import { toOwnerMemberTicketView } from '@entities/owner-member';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function toTicketViews(today: Date) {
  return sortMemberTicketList(MOCK_MEMBER_TICKET_LIST).map((ticket) => toOwnerMemberTicketView(ticket, today));
}

function MemberTicketListPage() {
  const content = memberTicketListContent;
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? '';
  const { push } = useStackNavigation();
  const [today] = useState(() => new Date());
  const [filter, setFilter] = useState<TicketListFilter>('all');
  const tickets = toTicketViews(today);
  const counts = countTicketList(tickets);
  const visibleTickets = filterTicketList(tickets, filter);
  const filterLabel = TICKET_LIST_FILTERS.find((item) => item.id === filter)?.label ?? '';

  const handleCharge = () => {
    push({ pathname: route.owner.members.detail.ticketCharge.root.replace('[id]', petId) }).catch(() => undefined);
  };

  return (
    <div className='bg-bg-50 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{content.title}</Header.Title>
        <Header.RightSection>
          <ChargeButton onClick={handleCharge} />
        </Header.RightSection>
      </Header>

      {tickets.length > 0 ? (
        <div className='bg-bg-0'>
          <div className='scrollbar-hide flex gap-x1 overflow-x-auto px-5 py-3'>
            {TICKET_LIST_FILTERS.map((item) => (
              <StatusFilterChip
                key={item.id}
                selected={filter === item.id}
                className='shrink-0'
                onClick={() => setFilter(item.id)}
              >
                {`${item.label} ${counts[item.id]}`}
              </StatusFilterChip>
            ))}
          </div>
          <div className='bg-line-100 h-px w-full' />
        </div>
      ) : null}

      {tickets.length === 0 ? (
        <MemberTicketListEmpty />
      ) : (
        <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4'>
          {visibleTickets.length === 0 ? (
            <p className='body1-bold text-text-primary py-10 text-center'>{content.emptyFilter(filterLabel)}</p>
          ) : null}
          {visibleTickets.map((ticket) => (
            <TicketSummaryCard
              key={ticket.id}
              title={ticket.name}
              status={ticket.status}
              remainingCount={ticket.remainingCount}
              totalCount={ticket.totalCount}
              period={ticket.period}
              remainingDays={ticket.remainingDays ?? undefined}
              highlightRemaining={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { MemberTicketListPage };

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { ChargeButton, StatusFilterChip, TicketSummaryCard } from '@knockdog/ui';

import { memberTicketListContent } from '@views/owner/member-ticket-list/config/memberTicketListContent';
import {
  TICKET_LIST_FILTERS,
  filterTicketList,
  type TicketListFilter,
} from '@views/owner/member-ticket-list/model/memberTicketList';

import { MemberTicketListEmpty } from '@views/owner/member-ticket-list/ui/MemberTicketListEmpty';

import { Header } from '@widgets/Header';

import { usePetTicketListQuery } from '@entities/owner-pet-ticket';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

function MemberTicketListPage() {
  const content = memberTicketListContent;
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? '';
  const { push } = useStackNavigation();
  const { data, isLoading, isLoadingError, isRefetchError } = usePetTicketListQuery(petId);
  const [filter, setFilter] = useState<TicketListFilter>('all');
  const tickets = data?.tickets ?? [];
  const counts = data?.counts;
  const showLoadError = isLoadingError || (!isLoading && data == null);
  const visibleTickets = filterTicketList(tickets, filter);
  const filterLabel = TICKET_LIST_FILTERS.find((item) => item.id === filter)?.label ?? '';

  const handleCharge = () => {
    push({ pathname: route.owner.members.detail.ticketCharge.root.replace('[id]', petId) }).catch(() => undefined);
  };

  const handleOpenDetail = (ticketId: string) => {
    const pathname = route.owner.members.detail.tickets.detail.root
      .replace('[id]', petId)
      .replace('[ticketId]', ticketId);
    push({ pathname }).catch(() => undefined);
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

      {isLoading ? (
        <DelayedLoadingSpinner isLoading layout='content' className='py-10' />
      ) : showLoadError ? (
        <p className='body2-regular text-text-secondary py-10 text-center'>{content.errorText}</p>
      ) : tickets.length === 0 ? (
        <>
          {isRefetchError ? (
            <p className='body2-regular text-text-secondary py-10 text-center'>{content.errorText}</p>
          ) : null}
          <MemberTicketListEmpty />
        </>
      ) : (
        <>
          {isRefetchError ? (
            <p className='body2-regular text-text-secondary bg-bg-0 px-5 pt-3 text-center'>{content.errorText}</p>
          ) : null}
          {counts ? (
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
                className='cursor-pointer'
                onClick={() => handleOpenDetail(ticket.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { MemberTicketListPage };

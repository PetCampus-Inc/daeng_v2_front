'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { MembershipCard, MEMBERSHIP_CARD_STATE, MembershipCardStatusBadge } from '@knockdog/ui';

import { createReservationMainMock } from '@views/guardian-reservation-page/config/guardianReservationMainMock';
import {
  TICKET_SECTION,
  TICKET_STATUS,
  formatManageTicket,
  getTicketBadge,
  groupManageTickets,
  type ReservationTicket,
  type TicketSectionId,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';
import { visibleTickets } from '@views/guardian-reservation-page/lib/guardianTicketHistory';
import { useHiddenTicketIds } from '@views/guardian-reservation-page/model/hiddenGuardianTickets';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

const SECTION_LABEL = {
  [TICKET_SECTION.active]: '사용 중',
  [TICKET_SECTION.inactive]: '비활성화',
  [TICKET_SECTION.expired]: '만료',
} as const satisfies Record<TicketSectionId, string>;

function toCardState(status: ReservationTicket['status']) {
  if (status === TICKET_STATUS.onHold) return MEMBERSHIP_CARD_STATE.onHold;
  if (status === TICKET_STATUS.scheduled) return MEMBERSHIP_CARD_STATE.scheduled;
  if (status === TICKET_STATUS.expired) return MEMBERSHIP_CARD_STATE.expired;
  return MEMBERSHIP_CARD_STATE.active;
}

function GuardianTicketManagePage() {
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const today = useMemo(() => new Date(), []);
  const dogs = useMemo(() => createReservationMainMock(today), [today]);
  const hiddenIds = useHiddenTicketIds();
  const dog = dogs.find((item) => item.id === dogId) ?? dogs[0];
  const sections = dog ? groupManageTickets(visibleTickets(dog.tickets, hiddenIds)) : [];

  const handleBack = useCallback(() => {
    back()
      .then((wentBack) => {
        if (wentBack) return;
        return navigateToTab('/reservation');
      })
      .catch(() => navigateToTab('/reservation'))
      .catch(() => undefined);
  }, [back, navigateToTab]);

  useNativeBackHandler(handleBack);

  const handleOpenDetail = (ticketId: string) => {
    if (!dog) return;
    push({
      pathname: route.reservation.tickets.detail.root.replace('[ticketId]', ticketId),
      query: { dogId: dog.id },
    }).catch(() => undefined);
  };

  return (
    <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>이용권 관리</Header.Title>
      </Header>

      <div className='px-x4 py-x5 gap-x7 pb-[calc(var(--bottom-bar-height)+20px)] webview:pb-x5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain'>
        {sections.map((section) => (
          <section key={section.id} className='gap-x2_5 flex flex-col'>
            <h2 className='body2-bold text-text-secondary'>{SECTION_LABEL[section.id]}</h2>
            {section.tickets.map((ticket) => {
              const copy = formatManageTicket(ticket);
              const badge = ticket.status === TICKET_STATUS.active ? getTicketBadge(ticket.endsOn, today) : null;

              return (
                <MembershipCard
                  key={ticket.id}
                  state={toCardState(ticket.status)}
                  onClick={() => handleOpenDetail(ticket.id)}
                  title={ticket.name}
                  periodLead={copy.periodLead}
                  period={copy.period}
                  count={copy.count}
                  total={copy.total}
                  badge={
                    badge ? (
                      <MembershipCardStatusBadge status={badge.status}>{badge.label}</MembershipCardStatusBadge>
                    ) : undefined
                  }
                />
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

export { GuardianTicketManagePage };

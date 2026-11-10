'use client';

import { useSearchParams } from 'next/navigation';

import { MembershipCard, MembershipCardStatusBadge } from '@knockdog/ui';

import { leaveReservationTab } from '@views/guardian-reservation-page/lib/leaveReservationTab';
import {
  RESERVATION_EMPTY,
  TICKET_SECTION,
  TICKET_STATUS,
  formatManageTicket,
  getTicketBadge,
  type ReservationTicket,
  type TicketSectionId,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';
import { ReservationEmptyState } from '@views/guardian-reservation-page/ui/ReservationEmptyState';
import { toCardState } from '@views/guardian-reservation-page/ui/ticketCardState';

import { Header } from '@widgets/Header';

import { useGuardianHomeQuery } from '@entities/guardian-home';
import { useGuardianTicketManageQuery, type GuardianTicket } from '@entities/guardian-ticket';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

const SECTION_LABEL = {
  [TICKET_SECTION.active]: '사용 중',
  [TICKET_SECTION.inactive]: '비활성화',
  [TICKET_SECTION.expired]: '만료',
} as const satisfies Record<TicketSectionId, string>;

function asManageTicket(ticket: GuardianTicket): ReservationTicket {
  const hold = ticket.status === TICKET_STATUS.onHold ? ticket.hold : null;

  return {
    id: ticket.id,
    name: ticket.name,
    totalCount: ticket.totalCount,
    remainingCount: ticket.remainingCount,
    startsOn: hold?.startsOn ?? ticket.startsOn,
    endsOn: ticket.status === TICKET_STATUS.expired ? (ticket.expiredOn ?? ticket.endsOn) : (hold?.endsOn ?? ticket.endsOn),
    chargedAt: ticket.startsOn,
    status: ticket.status,
  };
}

function GuardianTicketManagePage() {
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const petId = /^\d+$/.test(dogId) ? dogId : '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: home } = useGuardianHomeQuery({ userId, petId, enabled: Boolean(petId) });
  const manageQuery = useGuardianTicketManageQuery(petId);
  const today = new Date();
  const manage = manageQuery.data;
  const sections = manage
    ? (
        [
          [TICKET_SECTION.active, manage.available],
          [TICKET_SECTION.inactive, manage.inactive],
          [TICKET_SECTION.expired, manage.expired],
        ] as const
      ).flatMap(([id, tickets]) => (tickets.length === 0 ? [] : [{ id, tickets: tickets.map(asManageTicket) }]))
    : [];
  const school = home?.school;
  const kindergarten = school?.placeId
    ? { placeId: school.placeId, name: school.name, address: school.address, phone: '' }
    : null;

  const handleBack = () => {
    leaveReservationTab(back, navigateToTab);
  };

  useNativeBackHandler(handleBack);

  const handleOpenDetail = (ticketId: string) => {
    if (!petId) return;
    push({
      pathname: route.reservation.tickets.detail.root.replace('[ticketId]', ticketId),
      query: { dogId: petId },
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

      {manageQuery.isLoading ? (
        <DelayedLoadingSpinner isLoading layout='content' className='py-10' />
      ) : manageQuery.isError ? (
        <p className='body2-regular text-text-secondary py-10 text-center'>이용권을 불러오지 못했어요</p>
      ) : sections.length === 0 ? (
        <ReservationEmptyState kind={RESERVATION_EMPTY.noPass} kindergarten={kindergarten} />
      ) : (
        <div className='px-x4 py-x5 gap-x7 webview:pb-x5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(var(--bottom-bar-height)+20px)]'>
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
      )}
    </div>
  );
}

export { GuardianTicketManagePage };

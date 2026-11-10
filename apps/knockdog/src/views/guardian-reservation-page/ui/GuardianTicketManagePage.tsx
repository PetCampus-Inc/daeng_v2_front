'use client';

import { useSearchParams } from 'next/navigation';

import { MembershipCard, MembershipCardStatusBadge } from '@knockdog/ui';

import { leaveReservationTab } from '@views/guardian-reservation-page/lib/leaveReservationTab';
import { countTicketUses, remainingAfterUses } from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import {
  RESERVATION_EMPTY,
  TICKET_SECTION,
  TICKET_STATUS,
  formatManageTicket,
  getTicketBadge,
  groupManageTickets,
  type TicketSectionId,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';
import { visibleTickets } from '@views/guardian-reservation-page/lib/guardianTicketHistory';
import { useBookedVisits } from '@views/guardian-reservation-page/model/bookedVisits';
import { useHiddenTicketIds } from '@views/guardian-reservation-page/model/hiddenGuardianTickets';
import { useReservationDogs } from '@views/guardian-reservation-page/model/useReservationDogs';
import { ReservationEmptyState } from '@views/guardian-reservation-page/ui/ReservationEmptyState';
import { toCardState } from '@views/guardian-reservation-page/ui/ticketCardState';

import { Header } from '@widgets/Header';

import { useGuardianHomeQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

const SECTION_LABEL = {
  [TICKET_SECTION.active]: '사용 중',
  [TICKET_SECTION.inactive]: '비활성화',
  [TICKET_SECTION.expired]: '만료',
} as const satisfies Record<TicketSectionId, string>;

function GuardianTicketManagePage() {
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { now: today, dogs } = useReservationDogs();
  const hiddenIds = useHiddenTicketIds();
  const visits = useBookedVisits();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: home } = useGuardianHomeQuery({ userId, petId: dogId, enabled: Boolean(dogId) });
  const dog = dogs.find((item) => item.id === dogId) ?? dogs[0];
  const sections = dog ? groupManageTickets(visibleTickets(dog.tickets, hiddenIds)) : [];
  const school = home?.school;
  const kindergarten = school?.placeId
    ? { placeId: school.placeId, name: school.name, address: school.address, phone: '' }
    : null;

  const handleBack = () => {
    leaveReservationTab(back, navigateToTab);
  };

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

      {sections.length === 0 ? (
        <ReservationEmptyState kind={RESERVATION_EMPTY.noPass} kindergarten={kindergarten} />
      ) : (
        <div className='px-x4 py-x5 gap-x7 webview:pb-x5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(var(--bottom-bar-height)+20px)]'>
          {sections.map((section) => (
            <section key={section.id} className='gap-x2_5 flex flex-col'>
              <h2 className='body2-bold text-text-secondary'>{SECTION_LABEL[section.id]}</h2>
              {section.tickets.map((ticket) => {
                const shown = {
                  ...ticket,
                  remainingCount: remainingAfterUses(ticket.remainingCount, countTicketUses(visits, ticket.id)),
                };
                const copy = formatManageTicket(shown);
                const badge = shown.status === TICKET_STATUS.active ? getTicketBadge(shown.endsOn, today) : null;

                return (
                  <MembershipCard
                    key={ticket.id}
                    state={toCardState(shown.status)}
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

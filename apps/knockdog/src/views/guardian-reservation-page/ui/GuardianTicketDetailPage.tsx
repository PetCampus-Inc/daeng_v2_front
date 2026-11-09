'use client';

import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { InfoLine, TrashV4 } from '@knockdog/icons';
import { MembershipCard, MEMBERSHIP_CARD_STATE, MembershipCardStatusBadge } from '@knockdog/ui';

import { createReservationMainMock, findTicketHistory } from '@views/guardian-reservation-page/config/guardianReservationMainMock';
import {
  TICKET_STATUS,
  formatManageTicket,
  getTicketBadge,
  type ReservationTicket,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';
import {
  createChargeHistory,
  visibleTickets,
} from '@views/guardian-reservation-page/lib/guardianTicketHistory';
import { hideGuardianTicket, useHiddenTicketIds } from '@views/guardian-reservation-page/model/hiddenGuardianTickets';
import { GuardianTicketDeleteDialog } from '@views/guardian-reservation-page/ui/GuardianTicketDeleteDialog';
import { GuardianTicketHistoryList } from '@views/guardian-reservation-page/ui/GuardianTicketHistoryList';
import { Header } from '@widgets/Header';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

function toCardState(status: ReservationTicket['status']) {
  if (status === TICKET_STATUS.onHold) return MEMBERSHIP_CARD_STATE.onHold;
  if (status === TICKET_STATUS.scheduled) return MEMBERSHIP_CARD_STATE.scheduled;
  if (status === TICKET_STATUS.expired) return MEMBERSHIP_CARD_STATE.expired;
  return MEMBERSHIP_CARD_STATE.active;
}

function GuardianTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const searchParams = useSearchParams();
  const ticketId = params.ticketId ?? '';
  const dogId = searchParams.get('dogId') ?? '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const dogs = useMemo(() => createReservationMainMock(today), [today]);
  const hiddenIds = useHiddenTicketIds();
  const dog = dogs.find((item) => item.id === dogId) ?? dogs[0];
  const selectedDogId = dog?.id ?? '';
  const ticket = dog ? visibleTickets(dog.tickets, hiddenIds).find((item) => item.id === ticketId) : undefined;
  const isExpired = ticket?.status === TICKET_STATUS.expired;
  const history = ticket ? (findTicketHistory(ticket.id) ?? [createChargeHistory(ticket)]) : [];

  const handleBack = () => {
    back()
      .then((wentBack) => {
        if (wentBack) return;
        if (!selectedDogId) return navigateToTab('/reservation');
        return push({ pathname: route.reservation.tickets.root, query: { dogId: selectedDogId } });
      })
      .catch(() => navigateToTab('/reservation'))
      .catch(() => undefined);
  };

  useNativeBackHandler(handleBack);

  const handleConfirmDelete = () => {
    if (!ticket || !selectedDogId) return;
    const deletedDogId = selectedDogId;
    hideGuardianTicket(ticket.id);
    setIsDeleteOpen(false);
    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      title: '이용권이 삭제되었어요',
      nativeTitle: '이용권이 삭제되었어요',
    });
    back()
      .then((wentBack) => {
        if (wentBack) return;
        return push({ pathname: route.reservation.tickets.root, query: { dogId: deletedDogId } });
      })
      .catch(() => push({ pathname: route.reservation.tickets.root, query: { dogId: deletedDogId } }))
      .catch(() => undefined);
  };

  if (!ticket) return null;

  const copy = formatManageTicket(ticket);
  const badge = ticket.status === TICKET_STATUS.active ? getTicketBadge(ticket.endsOn, today) : null;

  return (
    <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>이용권 상세</Header.Title>
      </Header>

      <div className='pb-[calc(var(--bottom-bar-height)+20px)] webview:pb-x5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain'>
        <section className={isExpired ? 'bg-bg-100 flex flex-col' : 'bg-bg-0 flex flex-col'}>
          <MembershipCard
            state={toCardState(ticket.status)}
            title={ticket.name}
            periodLead={copy.periodLead}
            period={copy.period}
            count={copy.count}
            total={copy.total}
            showIcon={isExpired}
            className='rounded-none'
            icon={
              isExpired ? (
                <button type='button' aria-label='이용권 삭제' className='shrink-0' onClick={() => setIsDeleteOpen(true)}>
                  <TrashV4 className='text-fill-secondary-500' />
                </button>
              ) : undefined
            }
            badge={
              badge ? (
                <MembershipCardStatusBadge status={badge.status}>{badge.label}</MembershipCardStatusBadge>
              ) : undefined
            }
          />
          {isExpired ? null : (
            <div className='px-x5 pb-x5'>
              <div className='bg-fill-secondary-50 radius-r3 p-x4 gap-x1 flex items-start'>
                <InfoLine className='text-text-secondary mt-x1 size-[14px] shrink-0' />
                <div className='flex flex-col'>
                  <p className='body1-bold text-text-secondary'>홀딩이나 기간 연장이 필요하신가요?</p>
                  <p className='body2-regular text-text-tertiary'>이용권 변경은 유치원에 문의해 주세요.</p>
                </div>
              </div>
            </div>
          )}
        </section>
        <div className='h-x2 shrink-0' />
        <GuardianTicketHistoryList entries={history} />
      </div>

      <GuardianTicketDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export { GuardianTicketDetailPage };

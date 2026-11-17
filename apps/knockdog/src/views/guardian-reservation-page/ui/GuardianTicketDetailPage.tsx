'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { InfoLine, TrashV4 } from '@knockdog/icons';
import { MembershipCard, MembershipCardStatusBadge } from '@knockdog/ui';

import {
  TICKET_STATUS,
  formatManageTicket,
  getTicketBadge,
  isTicketExhausted,
  type ReservationTicket,
} from '@views/guardian-reservation-page/lib/guardianReservationMain';
import type { TicketHistory } from '@views/guardian-reservation-page/lib/guardianTicketHistory';
import { toCardState } from '@views/guardian-reservation-page/ui/ticketCardState';
import { GuardianTicketDeleteDialog } from '@views/guardian-reservation-page/ui/GuardianTicketDeleteDialog';
import { GuardianTicketHistoryList } from '@views/guardian-reservation-page/ui/GuardianTicketHistoryList';
import { Header } from '@widgets/Header';

import { useDeleteTicketMutation, useGuardianTicketDetailQuery, type GuardianTicket } from '@entities/guardian-ticket';

import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';

function numericId(value: string) {
  return /^\d+$/.test(value) ? value : '';
}

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
    endReason: ticket.endReason,
  };
}

function DetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <Header>
      <Header.LeftSection>
        <Header.BackButton onClick={onBack} />
      </Header.LeftSection>
      <Header.Title>이용권 상세</Header.Title>
    </Header>
  );
}

function GuardianTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const searchParams = useSearchParams();
  const ticketId = numericId(params.ticketId ?? '');
  const petId = numericId(searchParams.get('dogId') ?? '');
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [today] = useState(() => new Date());
  const detailQuery = useGuardianTicketDetailQuery(petId, ticketId);
  const deleteTicket = useDeleteTicketMutation(petId, ticketId);
  const detail = detailQuery.data;
  const ticket = detail ? asManageTicket(detail.ticket) : undefined;
  const isExpired = ticket?.status === TICKET_STATUS.expired;
  const history: TicketHistory[] = detail?.history ?? [];

  const handleBack = () => {
    back()
      .then((wentBack) => {
        if (wentBack) return;
        if (!petId) return navigateToTab('/reservation');
        return push({ pathname: route.reservation.tickets.root, query: { dogId: petId } });
      })
      .catch(() => navigateToTab('/reservation'))
      .catch(() => undefined);
  };

  useNativeBackHandler(handleBack);

  const handleConfirmDelete = () => {
    if (!ticket || !petId || deleteTicket.isPending) return;

    deleteTicket.mutate(undefined, {
      onSuccess: () => {
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
            return push({ pathname: route.reservation.tickets.root, query: { dogId: petId } });
          })
          .catch(() => push({ pathname: route.reservation.tickets.root, query: { dogId: petId } }))
          .catch(() => undefined);
      },
      onError: (error) => {
        const message = error instanceof ApiError && error.message ? error.message : '이용권을 삭제하지 못했어요';
        toast({
          type: 'default',
          shape: 'rounded',
          position: 'bottom',
          title: message,
          nativeTitle: message,
        });
      },
    });
  };

  if (!petId || !ticketId) {
    return (
      <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col'>
        <DetailHeader onBack={handleBack} />
        <p className='body1-regular text-text-secondary px-x4 py-x8 text-center'>이용권을 찾을 수 없어요</p>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col'>
        <DetailHeader onBack={handleBack} />
        <DelayedLoadingSpinner isLoading layout='content' className='py-10' />
      </div>
    );
  }

  if (detailQuery.isError || !ticket) {
    return (
      <div className='bg-bg-50 flex h-full min-h-0 flex-1 flex-col'>
        <DetailHeader onBack={handleBack} />
        <p className='body1-regular text-text-secondary px-x4 py-x8 text-center'>이용권을 불러오지 못했어요</p>
      </div>
    );
  }

  const copy = formatManageTicket(ticket);
  const badge = isTicketExhausted(ticket)
    ? { status: 'expired' as const, label: '소진' }
    : ticket.status === TICKET_STATUS.active
      ? getTicketBadge(ticket.endsOn, today)
      : null;

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden'>
      <DetailHeader onBack={handleBack} />

      <div className='webview:pb-x5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(var(--bottom-bar-height)+20px)]'>
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
              badge ? <MembershipCardStatusBadge status={badge.status}>{badge.label}</MembershipCardStatusBadge> : undefined
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
        <div className='bg-bg-50 h-x2 shrink-0' />
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

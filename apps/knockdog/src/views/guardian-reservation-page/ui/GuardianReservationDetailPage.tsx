'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { Call, Copy, InfoLine, LocationFill, RsvInfoCircle } from '@knockdog/icons';
import { ActionButton } from '@knockdog/ui';

import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { RESERVATION_DETAIL_COPY } from '@views/guardian-reservation-page/config/guardianReservationDetail';
import { RESERVATION_ACTION_TOAST_VIEWPORT } from '@views/guardian-reservation-page/config/guardianReservationToast';
import { leaveReservationTab } from '@views/guardian-reservation-page/lib/leaveReservationTab';
import { isNoteFilled } from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import {
  formatCancelWhen,
  formatDeadlineLead,
  formatDetailClock,
  formatDetailDate,
} from '@views/guardian-reservation-page/lib/guardianReservationDetail';
import { publishCancelNotice } from '@views/guardian-reservation-page/model/bookedVisits';
import { ReservationCancelDialog } from '@views/guardian-reservation-page/ui/ReservationCancelDialog';

import { Header } from '@widgets/Header';

import { useCancelReservationMutation, useReservationDetailQuery } from '@entities/guardian-reservation';
import { guardianTicketQueryKeys } from '@entities/guardian-ticket';

import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';

function DetailInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='gap-x5 flex items-center'>
      <p className='body2-regular text-text-secondary w-10 shrink-0'>{label}</p>
      <p className='body1-bold text-text-primary min-w-0 flex-1'>{value}</p>
    </div>
  );
}

function GuardianReservationDetailPage() {
  const copy = RESERVATION_DETAIL_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const reservationId = searchParams.get('reservationId') ?? '';
  const petId = /^\d+$/.test(dogId) ? dogId : '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { pets } = useGuardianSelectedPet();
  const detailQuery = useReservationDetailQuery(petId, /^\d+$/.test(reservationId) ? reservationId : '');
  const queryClient = useQueryClient();
  const cancelReservation = useCancelReservationMutation();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const detail = detailQuery.data;
  const pet = pets.find((item) => String(item.id) === petId);
  const canCancel = detail?.cancelable ?? false;
  const isCancelling = cancelReservation.isPending;

  const handleBack = () => {
    leaveReservationTab(back, navigateToTab);
  };

  useNativeBackHandler(handleBack);

  if (detailQuery.isLoading) {
    return (
      <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{copy.title}</Header.Title>
        </Header>
        <DelayedLoadingSpinner isLoading layout='content' className='py-10' />
      </div>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{copy.title}</Header.Title>
        </Header>
        <p className='body2-regular text-text-secondary py-10 text-center'>{copy.loadError}</p>
      </div>
    );
  }

  const hasNote = isNoteFilled(detail.note);
  const summary = [pet?.name, detail.schoolName].filter(Boolean).join(' · ');

  const handleCopyPhone = () => {
    if (!detail.schoolPhone) return;
    const write = navigator.clipboard?.writeText(detail.schoolPhone);
    if (!write) return;
    write
      .then(() => {
        toast({
          type: 'success',
          shape: 'rounded',
          position: 'bottom',
          title: copy.phoneCopied,
          nativeTitle: copy.phoneCopied,
          viewportClassName: RESERVATION_ACTION_TOAST_VIEWPORT,
        });
      })
      .catch(() => undefined);
  };

  const handleConfirmCancel = () => {
    if (isCancelling || !canCancel) return;
    cancelReservation.mutate(
      { petId, reservationId: detail.id },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: guardianTicketQueryKeys.all });
          syncWebViewQuery.invalidate([...guardianTicketQueryKeys.all]);
          publishCancelNotice(detail.startsAt);
          setIsCancelOpen(false);
          back()
            .then((wentBack) => {
              if (wentBack) return;
              return push({ pathname: route.reservation.list.root, query: { dogId: petId } });
            })
            .catch(() => undefined);
        },
        onError: (error) => {
          setIsCancelOpen(false);
          const message = error instanceof ApiError && error.message ? error.message : copy.cancelFailed;
          toast({
            type: 'default',
            shape: 'rounded',
            position: 'bottom',
            title: message,
            nativeTitle: message,
            viewportClassName: RESERVATION_ACTION_TOAST_VIEWPORT,
          });
        },
      }
    );
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{copy.title}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <section className='px-x4 pt-x7 pb-x5 gap-x2 flex flex-col'>
          <div className='px-x2 gap-x2 flex flex-col'>
            <DetailInfoRow label={copy.kindergarten} value={detail.schoolName} />
            <DetailInfoRow label={copy.date} value={formatDetailDate(detail.startsAt)} />
            <DetailInfoRow label={copy.time} value={formatDetailClock(detail.startsAt)} />
          </div>
          {canCancel ? (
            <div className='radius-r2 px-x1 py-x2 gap-x1 flex items-center'>
              <InfoLine className='text-text-accent size-[14px] shrink-0' />
              <p className='caption1-regular'>
                <span className='text-text-accent whitespace-pre'>{formatDeadlineLead(detail.startsAt)}</span>
                <span className='text-text-tertiary'>{copy.deadlineSuffix}</span>
              </p>
            </div>
          ) : (
            <div className='radius-r2 px-x1 py-x2 gap-x1 flex items-center'>
              <RsvInfoCircle className='text-error size-[14px] shrink-0' />
              <p className='caption1-regular text-error'>{copy.deadlinePassed}</p>
            </div>
          )}
        </section>

        <section className='px-x4 py-x5 gap-x2 flex flex-col'>
          <h2 className='body2-bold text-text-primary'>{copy.noteLabel}</h2>
          {hasNote ? (
            <>
              <div className='bg-bg-50 radius-r2 px-x4 py-x4'>
                <p className='body2-regular text-text-primary'>{detail.note}</p>
              </div>
              <p className='body2-regular text-text-tertiary'>{copy.noteHint}</p>
            </>
          ) : (
            <div className='bg-bg-50 radius-r2 p-x4 flex items-center justify-center'>
              <p className='label-semibold text-text-tertiary'>{copy.noteEmpty}</p>
            </div>
          )}
        </section>

        <section className='px-x4 py-x5 gap-x2 flex flex-col'>
          <h2 className='body2-bold text-text-primary'>{copy.placeLabel}</h2>
          <div className='border-line-200 radius-r4 bg-bg-0 h-[150px] w-full border border-solid' />
          <div className='gap-x1 py-x0_5 flex items-start'>
            <LocationFill className='text-text-secondary size-5 shrink-0' />
            <div className='gap-x0_5 flex min-w-0 flex-1 flex-col'>
              <p className='body2-semibold text-text-primary'>{detail.schoolName}</p>
              <p className='body2-regular text-text-primary'>{detail.schoolAddress}</p>
            </div>
          </div>
          {detail.schoolPhone ? (
            <div className='gap-x1 py-x0_5 flex items-start'>
              <Call className='text-text-secondary size-5 shrink-0' />
              <div className='gap-x2 flex items-center'>
                <p className='body2-regular text-text-primary'>{detail.schoolPhone}</p>
                <button type='button' aria-label={copy.phoneCopied} className='shrink-0' onClick={handleCopyPhone}>
                  <Copy className='text-text-secondary size-4' />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className='bg-bg-0 p-x4 webview:pb-[calc(var(--safe-area-inset-bottom,0px)+16px)] shrink-0'>
        <ActionButton
          type='button'
          variant={canCancel ? 'secondaryLine' : 'primaryFill'}
          size='large'
          className='body1-bold'
          disabled={!canCancel || isCancelling}
          onClick={() => setIsCancelOpen(true)}
        >
          {copy.cancel}
        </ActionButton>
      </div>

      <ReservationCancelDialog
        isOpen={isCancelOpen}
        whenLabel={formatCancelWhen(detail.startsAt)}
        summary={summary}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export { GuardianReservationDetailPage };

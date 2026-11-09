'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Call, Copy, InfoLine, LocationFill, RsvInfoCircle } from '@knockdog/icons';
import { ActionButton } from '@knockdog/ui';

import { RESERVATION_DETAIL_COPY } from '@views/guardian-reservation-page/config/guardianReservationDetail';
import { createReservationMainMock } from '@views/guardian-reservation-page/config/guardianReservationMainMock';
import { NOTE_LIMIT, isNoteFilled } from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import {
  canCancelReservation,
  formatCancelWhen,
  formatDeadlineLead,
  formatDetailClock,
  formatDetailDate,
} from '@views/guardian-reservation-page/lib/guardianReservationDetail';
import { collectReservations } from '@views/guardian-reservation-page/lib/guardianReservationList';
import {
  cancelReservation,
  publishCancelNotice,
  useBookedVisits,
  useCancelledIds,
} from '@views/guardian-reservation-page/model/bookedVisits';
import { ReservationCancelDialog } from '@views/guardian-reservation-page/ui/ReservationCancelDialog';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
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
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const now = useMemo(() => new Date(), []);
  const dogs = useMemo(() => createReservationMainMock(now), [now]);
  const visits = useBookedVisits();
  const cancelledIds = useCancelledIds();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const dog = dogs.find((item) => item.id === dogId) ?? dogs[0];
  const item = dog
    ? collectReservations(dog.id, now, dog.upcoming?.startsAt ?? null, visits, cancelledIds).find(
        (reservation) => reservation.id === reservationId
      )
    : undefined;
  const canCancel = item ? canCancelReservation(item.startsAt, now) : false;
  const place = dog?.kindergarten;

  const handleBack = () => {
    navigateToTab('/reservation').catch(() => undefined);
  };

  useNativeBackHandler(handleBack);

  if (!dog || !item) return null;

  const hasNote = isNoteFilled(item.note);

  const handleCopyPhone = () => {
    if (!place?.phone) return;
    const write = navigator.clipboard?.writeText(place.phone);
    if (!write) return;
    write
      .then(() => {
        toast({
          type: 'success',
          shape: 'rounded',
          position: 'bottom',
          title: copy.phoneCopied,
          nativeTitle: copy.phoneCopied,
        });
      })
      .catch(() => undefined);
  };

  const handleConfirmCancel = () => {
    if (isCancelling || !canCancel) return;
    if (!cancelReservation(item.id)) {
      setIsCancelOpen(false);
      return;
    }
    setIsCancelling(true);
    publishCancelNotice(item.startsAt);
    setIsCancelOpen(false);
    back()
      .then((wentBack) => {
        if (wentBack) return;
        return push({ pathname: route.reservation.list.root, query: { dogId: dog.id } });
      })
      .catch(() => undefined);
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
        <section className='px-x4 pt-x5 pb-x5 gap-x4 flex flex-col'>
          <DetailInfoRow label={copy.kindergarten} value={place?.name ?? ''} />
          <DetailInfoRow label={copy.date} value={formatDetailDate(item.startsAt)} />
          <DetailInfoRow label={copy.time} value={formatDetailClock(item.startsAt)} />
          {canCancel ? (
            <div className='gap-x1 flex items-center'>
              <InfoLine className='text-text-accent size-4 shrink-0' />
              <p className='body2-regular'>
                <span className='text-text-accent whitespace-pre'>{formatDeadlineLead(item.startsAt)}</span>
                <span className='text-text-tertiary'>{copy.deadlineSuffix}</span>
              </p>
            </div>
          ) : (
            <div className='gap-x1 px-x1 py-x2 flex items-center'>
              <RsvInfoCircle className='text-error shrink-0' />
              <p className='caption1-regular text-error'>{copy.deadlinePassed}</p>
            </div>
          )}
        </section>

        <div className='bg-line-100 h-x2 w-full shrink-0' />

        <section className='px-x4 pt-x5 pb-x5 gap-x3 flex flex-col'>
          <h2 className='body2-bold text-text-primary'>{copy.noteLabel}</h2>
          {hasNote ? (
            <>
              <div className='bg-fill-secondary-50 radius-r2 px-x4 py-x4 gap-x2 flex flex-col'>
                <p className='body2-regular text-text-primary'>{item.note}</p>
                <p className='body2-regular text-right'>
                  <span className='text-text-accent'>{item.note.length}</span>
                  <span className='text-text-caption'>/{NOTE_LIMIT}</span>
                </p>
              </div>
              <p className='body2-regular text-text-tertiary'>{copy.noteHint}</p>
            </>
          ) : (
            <div className='bg-fill-secondary-50 radius-r2 px-x4 py-x4 flex items-center justify-center'>
              <p className='body2-regular text-text-tertiary'>{copy.noteEmpty}</p>
            </div>
          )}
        </section>

        <div className='bg-line-100 h-x2 w-full shrink-0' />

        <section className='px-x4 pt-x5 pb-x5 gap-x3 flex flex-col'>
          <h2 className='body2-bold text-text-primary'>{copy.placeLabel}</h2>
          <div className='border-line-200 radius-r4 bg-bg-50 h-[150px] w-full' />
          <div className='gap-x1 flex items-start'>
            <LocationFill className='text-text-secondary size-5 shrink-0' />
            <div className='min-w-0 flex-1'>
              <p className='body2-semibold text-text-primary'>{place?.name}</p>
              <p className='body2-regular text-text-secondary'>{place?.address}</p>
            </div>
          </div>
          {place?.phone ? (
            <div className='gap-x1 flex items-start'>
              <Call className='text-text-secondary size-5 shrink-0' />
              <div className='gap-x2 flex items-center'>
                <p className='body2-regular text-text-primary'>{place.phone}</p>
                <button type='button' aria-label={copy.phoneCopied} className='shrink-0' onClick={handleCopyPhone}>
                  <Copy className='text-text-secondary size-4' />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <div className='bg-bg-0 px-x4 py-x4 shrink-0'>
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
        whenLabel={formatCancelWhen(item.startsAt)}
        summary={`${dog.name} · ${place?.name ?? ''}`}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export { GuardianReservationDetailPage };

'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { ActionButton, BottomSheet, RsvConfirmedSheet, SelectDogCard, Textarea, TextareaInput } from '@knockdog/ui';

import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';
import { RESERVATION_CONFIRM_COPY } from '@views/guardian-reservation-page/config/guardianReservationConfirm';
import { RESERVATION_CONFIRM_TOAST_VIEWPORT } from '@views/guardian-reservation-page/config/guardianReservationToast';
import {
  clipNote,
  formatConfirmDate,
  formatRemainingCount,
  isNoteFilled,
  NOTE_LIMIT,
  readReserveQuery,
  toVisitStartsAt,
} from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import { dateFromKey, formatReserveClock } from '@views/guardian-reservation-page/lib/guardianReservationSchedule';
import { clearReserveDraft } from '@views/guardian-reservation-page/model/reserveDraft';
import { ReservationLeaveDialog } from '@views/guardian-reservation-page/ui/ReservationLeaveDialog';

import { Header } from '@widgets/Header';

import { useCreateReservationMutation, type CreatedGuardianReservation } from '@entities/guardian-reservation';
import { guardianTicketQueryKeys } from '@entities/guardian-ticket';
import { useGuardianHomeQuery } from '@entities/guardian-home';
import { formatAge } from '@entities/pet';
import { useUserStore } from '@entities/user';

import { ApiError } from '@shared/api';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';

const FULL_CODE = 'RESERVATION-409-4';

function ConfirmInfoRow({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div className='px-x4 py-x3 flex items-start justify-between'>
      <p className='body2-regular text-text-secondary shrink-0'>{label}</p>
      <div className='gap-x0_5 flex flex-col items-end text-right'>
        <p className='body2-semibold text-text-primary'>{value}</p>
        {extra ? <p className='body2-regular text-text-accent'>{extra}</p> : null}
      </div>
    </div>
  );
}

function ConfirmDogAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  return (
    <DogProfileAvatar
      name={name}
      imageUrl={imageUrl}
      className='size-full border-0'
      pawClassName='text-fill-secondary-400'
    />
  );
}

function showFailedToast(message: string) {
  toast({
    type: 'default',
    shape: 'rounded',
    position: 'bottom',
    title: message,
    viewportClassName: RESERVATION_CONFIRM_TOAST_VIEWPORT,
  });
}

function showClosedToast() {
  const copy = RESERVATION_CONFIRM_COPY;
  toast({
    type: 'default',
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: `${copy.closedPrefix}${copy.closedAccent}${copy.closedSuffix}`,
    titleParts: [{ text: copy.closedPrefix }, { text: copy.closedAccent, accent: true }, { text: copy.closedSuffix }],
    title: (
      <>
        <span className='body1-medium text-text-primary-inverse whitespace-pre'>{copy.closedPrefix}</span>
        <span className='body1-bold text-text-accent'>{copy.closedAccent}</span>
        <span className='body1-medium text-text-primary-inverse'>{copy.closedSuffix}</span>
      </>
    ),
    viewportClassName: RESERVATION_CONFIRM_TOAST_VIEWPORT,
  });
}

function ReservationConfirmPage() {
  const copy = RESERVATION_CONFIRM_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const ticketId = searchParams.get('ticketId') ?? '';
  const petId = /^\d+$/.test(dogId) ? dogId : '';
  const ticketNumber = /^\d+$/.test(ticketId) ? Number(ticketId) : null;
  const selection = readReserveQuery(searchParams.get('date'), searchParams.get('minutes'));
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { pets, isPetsReady, isPetsError } = useGuardianSelectedPet();
  const userId = useUserStore((state) => state.user?.userId);
  const pet = pets.find((item) => String(item.id) === petId) ?? null;
  const { data: home } = useGuardianHomeQuery({ userId, petId: pet?.id, enabled: Boolean(pet) });
  const queryClient = useQueryClient();
  const createReservation = useCreateReservationMutation(petId);
  const [note, setNote] = useState('');
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [created, setCreated] = useState<CreatedGuardianReservation | null>(null);
  const isSubmitting = useRef(false);
  const idempotencyKey = useRef('');
  const requestSignature = useRef('');
  const isPending = createReservation.isPending;
  const canSubmit = Boolean(selection && petId && ticketNumber != null && Number.isSafeInteger(ticketNumber));

  const leaveToTime = () => {
    back()
      .then((wentBack) => {
        if (wentBack) return;
        return navigateToTab('/reservation');
      })
      .catch(() => navigateToTab('/reservation'))
      .catch(() => undefined);
  };

  const isLeaving = useRef(false);

  const handleDone = () => {
    if (isLeaving.current) return;
    isLeaving.current = true;
    setIsConfirmed(false);
    navigateToTab('/reservation').catch(() => {
      isLeaving.current = false;
      setIsConfirmed(true);
    });
  };

  const handleBack = () => {
    if (isPending) return;
    if (isConfirmed) {
      handleDone();
      return;
    }
    if (isLeaveOpen) {
      setIsLeaveOpen(false);
      return;
    }
    if (isNoteFilled(note)) {
      setIsLeaveOpen(true);
      return;
    }
    leaveToTime();
  };

  useNativeBackHandler(handleBack);

  const handleBook = () => {
    if (isSubmitting.current || isPending || isClosed || isConfirmed || !selection || !canSubmit || ticketNumber == null) {
      return;
    }

    const body = {
      ticketId: ticketNumber,
      date: selection.dateKey,
      time: toVisitStartsAt(selection.dateKey, selection.minutes).slice(11),
      requestMemo: note.trim() || null,
    };
    const signature = JSON.stringify(body);
    if (requestSignature.current !== signature) {
      requestSignature.current = signature;
      idempotencyKey.current = crypto.randomUUID();
    }

    isSubmitting.current = true;
    createReservation.mutate(
      { idempotencyKey: idempotencyKey.current, body },
      {
        onSuccess: async (reservation) => {
          clearReserveDraft();
          await queryClient.invalidateQueries({ queryKey: guardianTicketQueryKeys.all });
          syncWebViewQuery.invalidate([...guardianTicketQueryKeys.all]);
          setCreated(reservation);
          setIsConfirmed(true);
        },
        onError: (error) => {
          isSubmitting.current = false;
          if (error instanceof ApiError && error.code === FULL_CODE) {
            setIsClosed(true);
            showClosedToast();
            return;
          }
          const message = error instanceof ApiError && error.message ? error.message : copy.failed;
          showFailedToast(message);
        },
      }
    );
  };

  if (!selection || !canSubmit) return null;

  if (!isPetsReady) {
    return <DelayedLoadingSpinner isLoading layout='content' className='py-10' />;
  }

  if (isPetsError || !pet) {
    return <p className='body2-regular text-text-secondary py-10 text-center'>강아지를 불러오지 못했어요</p>;
  }

  const date = dateFromKey(selection.dateKey);
  const dogName = pet.name;
  const breed = pet.breed;
  const age = formatAge(pet.birthYear);
  const weight = pet.weight ? `${pet.weight}kg` : undefined;
  const kindergartenName = created?.schoolName || home?.school?.name || '';
  const remainingLabel = created ? formatRemainingCount(created.remainingCount) : undefined;
  const ticketLabel = created ? `${created.ticketName} 1회 사용` : '1회 사용';

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{copy.title}</Header.Title>
      </Header>

      <div className='pt-x4 flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <div className='px-x4 flex flex-col'>
          <div className='px-x4 py-x3'>
            <SelectDogCard
              variant='list'
              name={dogName}
              breed={breed}
              age={age}
              weight={weight}
              showIcon={false}
              className='border-line-200 !px-0 border-b border-solid py-x3'
            >
              <ConfirmDogAvatar name={dogName} imageUrl={pet.profileImage} />
            </SelectDogCard>
          </div>
          <ConfirmInfoRow label={copy.kindergarten} value={kindergartenName} />
          <ConfirmInfoRow label={copy.date} value={formatConfirmDate(date)} />
          <ConfirmInfoRow label={copy.time} value={formatReserveClock(selection.minutes)} />
          <ConfirmInfoRow label={copy.ticket} value={ticketLabel} extra={remainingLabel} />
        </div>
        <div className='bg-line-100 h-x2 w-full shrink-0' />
        <div className='gap-x2 py-x5 flex flex-col'>
          <div className='gap-x0_5 px-x4 flex items-center'>
            <p className='h3-semibold text-text-primary'>{copy.noteLabel}</p>
            <p className='label-medium text-text-tertiary'>{copy.noteOptional}</p>
          </div>
          <div className='px-x4 py-x3'>
            <Textarea className='gap-x8 flex min-h-[120px] flex-col' disabled={isPending || isConfirmed}>
              <TextareaInput
                value={note}
                maxLength={NOTE_LIMIT}
                rows={3}
                placeholder={copy.notePlaceholder}
                disabled={isPending || isConfirmed}
                className='h-auto min-h-[72px]'
                onChange={(event) => setNote(clipNote(event.target.value))}
              />
              <p className='body2-regular text-right'>
                <span className={note.length > 0 ? 'text-text-accent' : 'text-text-caption'}>{note.length}</span>
                <span className='text-text-caption'>/{NOTE_LIMIT}</span>
              </p>
            </Textarea>
          </div>
        </div>
      </div>

      <div className='bg-bg-0 px-x4 py-x4 shrink-0'>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='body1-bold'
          disabled={isPending || isClosed || isConfirmed || !canSubmit}
          aria-busy={isPending}
          onClick={handleBook}
        >
          {copy.book}
        </ActionButton>
      </div>

      <ReservationLeaveDialog
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onLeave={() => {
          setIsLeaveOpen(false);
          setNote('');
          leaveToTime();
        }}
      />

      <BottomSheet.Root
        open={isConfirmed}
        onOpenChange={(open) => {
          if (!open) handleDone();
        }}
      >
        <BottomSheet.Overlay />
        <BottomSheet.Body className='rounded-t-[24px] bg-transparent p-0 shadow-none'>
          <BottomSheet.Title className='sr-only'>예약이 확정되었어요</BottomSheet.Title>
          <RsvConfirmedSheet
            dogName={dogName}
            breed={breed}
            age={age}
            weight={weight}
            dogImage={<ConfirmDogAvatar name={dogName} imageUrl={pet.profileImage} />}
            kindergarten={kindergartenName}
            date={formatConfirmDate(date)}
            time={formatReserveClock(selection.minutes)}
            ticket={ticketLabel}
            remaining={remainingLabel}
            onClose={handleDone}
            onConfirm={handleDone}
            onMyReservations={() => {
              push({ pathname: route.reservation.list.root, query: { dogId: petId } }).catch(() => undefined);
            }}
          />
        </BottomSheet.Body>
      </BottomSheet.Root>
    </div>
  );
}

export { ReservationConfirmPage };

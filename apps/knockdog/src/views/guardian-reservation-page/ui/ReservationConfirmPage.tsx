'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { ActionButton, BottomSheet, RsvConfirmedSheet, SelectDogCard, Textarea, TextareaInput } from '@knockdog/ui';

import { RESERVATION_CONFIRM_COPY } from '@views/guardian-reservation-page/config/guardianReservationConfirm';
import {
  BOOKING_STATUS,
  clipNote,
  countTicketUses,
  formatConfirmDate,
  formatRemainingCount,
  formatTicketUse,
  isNoteFilled,
  isSameDayTaken,
  NOTE_LIMIT,
  readReserveQuery,
  remainingAfterUse,
  resolveBooking,
  toVisitStartsAt,
} from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import { formatDogAge, formatDogWeight } from '@views/guardian-reservation-page/lib/guardianReservationMain';
import {
  dateFromKey,
  formatReserveClock,
  isSlotBookable,
} from '@views/guardian-reservation-page/lib/guardianReservationSchedule';
import { bookVisit, useBookedVisits } from '@views/guardian-reservation-page/model/bookedVisits';
import { useReservationDogs } from '@views/guardian-reservation-page/model/useReservationDogs';
import { clearReserveDraft } from '@views/guardian-reservation-page/model/reserveDraft';
import { ReservationLeaveDialog } from '@views/guardian-reservation-page/ui/ReservationLeaveDialog';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

const SUBMIT_WAIT_MS = 300;

function ConfirmInfoRow({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div className='py-x3 flex items-start justify-between'>
      <p className='body2-regular text-text-secondary shrink-0'>{label}</p>
      <div className='gap-x0_5 flex flex-col items-end text-right'>
        <p className='body2-semibold text-text-primary'>{value}</p>
        {extra ? <p className='body2-regular text-text-accent'>{extra}</p> : null}
      </div>
    </div>
  );
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
  });
}

function ReservationConfirmPage() {
  const copy = RESERVATION_CONFIRM_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const ticketId = searchParams.get('ticketId') ?? '';
  const selection = readReserveQuery(searchParams.get('date'), searchParams.get('minutes'));
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { now, dogs } = useReservationDogs();
  const visits = useBookedVisits();
  const dog = dogs.find((item) => item.id === dogId);
  const ticket = dog?.tickets.find((item) => item.id === ticketId);
  const [note, setNote] = useState('');
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isSubmitting = useRef(false);

  const leaveToTime = () => {
    back()
      .then((wentBack) => {
        if (wentBack) return;
        return navigateToTab('/reservation');
      })
      .catch(() => navigateToTab('/reservation'))
      .catch(() => undefined);
  };

  const handleDone = () => {
    navigateToTab('/reservation').catch(() => undefined);
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
    if (isSubmitting.current || isPending || isClosed || isConfirmed || !selection || !dog || !ticket) return;

    const usedBefore = countTicketUses(visits, ticket.id);
    const upcomingOn = dog.upcoming?.startsAt.slice(0, 10) ?? null;
    const status = resolveBooking({
      isBookable: isSlotBookable(dateFromKey(selection.dateKey), selection.minutes, now, ticket.endsOn),
      remainingCount: ticket.remainingCount,
      usedBefore,
      isDayTaken: upcomingOn === selection.dateKey || isSameDayTaken(visits, dog.id, selection.dateKey),
    });
    const visit = {
      id: `book-${dog.id}-${selection.dateKey}-${selection.minutes}`,
      dogId: dog.id,
      ticketId: ticket.id,
      startsAt: toVisitStartsAt(selection.dateKey, selection.minutes),
      placeName: dog.kindergarten?.name ?? '',
      note: note.trim(),
      remainingCount: remainingAfterUse(ticket.remainingCount, usedBefore),
    };

    isSubmitting.current = true;
    setIsPending(true);

    window.setTimeout(() => {
      setIsPending(false);

      const isBooked = status === BOOKING_STATUS.booked && bookVisit(visit);
      if (!isBooked) {
        setIsClosed(true);
        isSubmitting.current = false;
        showClosedToast();
        return;
      }

      clearReserveDraft();
      setIsConfirmed(true);
    }, SUBMIT_WAIT_MS);
  };

  if (!dog || !ticket || !selection) return null;

  const date = dateFromKey(selection.dateKey);
  const remainingLabel = formatRemainingCount(
    remainingAfterUse(ticket.remainingCount, countTicketUses(visits, ticket.id))
  );
  const ticketLabel = formatTicketUse(ticket.totalCount);

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{copy.title}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        <SelectDogCard
          variant='list'
          name={dog.name}
          breed={dog.breed}
          age={formatDogAge(dog.age)}
          weight={formatDogWeight(dog.weightKg)}
          showIcon={false}
        />
        <div className='px-x4 flex flex-col'>
          <ConfirmInfoRow label={copy.kindergarten} value={dog.kindergarten?.name ?? ''} />
          <ConfirmInfoRow label={copy.date} value={formatConfirmDate(date)} />
          <ConfirmInfoRow label={copy.time} value={formatReserveClock(selection.minutes)} />
          <ConfirmInfoRow label={copy.ticket} value={ticketLabel} extra={remainingLabel} />
        </div>
        <div className='bg-line-100 h-x2 w-full shrink-0' />
        <div className='px-x4 py-x5 gap-x3 flex flex-col'>
          <div className='gap-x1 flex items-center'>
            <p className='h3-semibold text-text-primary'>{copy.noteLabel}</p>
            <p className='label-medium text-text-tertiary'>{copy.noteOptional}</p>
          </div>
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

      <div className='bg-bg-0 px-x4 py-x4 shrink-0'>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='body1-bold'
          disabled={isPending || isClosed || isConfirmed}
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
        handleOnly
        onOpenChange={(open) => {
          if (!open) handleDone();
        }}
      >
        <BottomSheet.Overlay />
        <BottomSheet.Body className='rounded-t-[24px] bg-transparent p-0 shadow-none'>
          <BottomSheet.Title className='sr-only'>예약이 확정되었어요</BottomSheet.Title>
          <RsvConfirmedSheet
            dogName={dog.name}
            breed={dog.breed}
            age={formatDogAge(dog.age)}
            weight={formatDogWeight(dog.weightKg)}
            kindergarten={dog.kindergarten?.name ?? ''}
            date={formatConfirmDate(date)}
            time={formatReserveClock(selection.minutes)}
            ticket={ticketLabel}
            remaining={remainingLabel}
            onClose={handleDone}
            onConfirm={handleDone}
            onMyReservations={() => {
              push({ pathname: route.reservation.list.root, query: { dogId: dog.id } }).catch(() => undefined);
            }}
          />
        </BottomSheet.Body>
      </BottomSheet.Root>
    </div>
  );
}

export { ReservationConfirmPage };

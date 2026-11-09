'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { ActionButton, RsvDateTime, RsvMonthlyCalendar, RsvTimetable } from '@knockdog/ui';

import { RESERVATION_TIME_COPY } from '@views/guardian-reservation-page/config/guardianReservationTime';
import {
  countTicketUses,
  isSameDayTaken,
  remainingAfterUses,
} from '@views/guardian-reservation-page/lib/guardianReservationConfirm';
import { leaveReservationTab } from '@views/guardian-reservation-page/lib/leaveReservationTab';
import { toDateKey } from '@views/guardian-reservation-page/lib/guardianReservationMain';
import {
  canContinueReserve,
  dateFromKey,
  formatReserveClock,
  formatReserveDay,
  formatSelectedPass,
  listDisabledDates,
  listScheduleSlots,
  reservedDateKeys,
  splitScheduleSlots,
  type ScheduleSlot,
} from '@views/guardian-reservation-page/lib/guardianReservationSchedule';
import { useBookedVisits } from '@views/guardian-reservation-page/model/bookedVisits';
import { useReservationDogs } from '@views/guardian-reservation-page/model/useReservationDogs';
import {
  clearReserveDraft,
  readReserveDraft,
  saveReserveDraft,
} from '@views/guardian-reservation-page/model/reserveDraft';

import { Header } from '@widgets/Header';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';

function slotState(slot: ScheduleSlot, selectedMinutes: number | null) {
  if (slot.minutes === selectedMinutes) return 'selected' as const;
  if (slot.isDisabled) return 'disabled' as const;
  return 'default' as const;
}

function toTimetableSlots(slots: ScheduleSlot[], selectedMinutes: number | null, onSelect: (minutes: number) => void) {
  return slots.map((slot) => ({
    time: slot.label,
    state: slotState(slot, selectedMinutes),
    isReserved: slot.isReserved,
    onSelect: () => onSelect(slot.minutes),
  }));
}

function GuardianReservationTimePage() {
  const copy = RESERVATION_TIME_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const ticketId = searchParams.get('ticketId') ?? '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { now, dogs } = useReservationDogs();
  const visits = useBookedVisits();
  const draft = readReserveDraft(dogId, ticketId);
  const restoredDate = draft ? dateFromKey(draft.dateKey) : null;
  const dog = dogs.find((item) => item.id === dogId);
  const ticket = dog?.tickets.find((item) => item.id === ticketId);
  const placeName = dog?.kindergarten?.name ?? '';
  const upcomingOn = dog?.upcoming?.startsAt.slice(0, 10) ?? null;
  const bookedDays = visits
    .filter((visit) => visit.dogId === dogId && !visit.isCancelled)
    .map((visit) => visit.startsAt.slice(0, 10));
  const reservedKeys = new Set([...reservedDateKeys(now, upcomingOn), ...bookedDays]);
  const reservedDates = [...reservedKeys].map(dateFromKey);
  const [month, setMonth] = useState(() => {
    const base = restoredDate ?? now;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(restoredDate);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(draft?.minutes ?? null);
  const disabledDates = listDisabledDates(month, now, now, ticket?.endsOn ?? null);
  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : null;
  const isReservedDay = selectedDateKey ? reservedKeys.has(selectedDateKey) : false;
  const hasActiveReservation = selectedDateKey
    ? upcomingOn === selectedDateKey || isSameDayTaken(visits, dogId, selectedDateKey)
    : false;
  const slots = selectedDate ? splitScheduleSlots(listScheduleSlots(selectedDate, now, isReservedDay)) : null;
  const canContinue = canContinueReserve(selectedDate != null, selectedMinutes != null) && !hasActiveReservation;

  const handleBack = () => {
    clearReserveDraft();
    leaveReservationTab(back, navigateToTab);
  };

  useNativeBackHandler(handleBack);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedMinutes(null);
    saveReserveDraft({ dogId, ticketId, dateKey: toDateKey(date), minutes: null });
  };

  const handleSelectMinutes = (minutes: number) => {
    setSelectedMinutes(minutes);
    if (!selectedDate) return;
    saveReserveDraft({ dogId, ticketId, dateKey: toDateKey(selectedDate), minutes });
  };

  const handleNext = () => {
    if (!canContinue || !selectedDate || selectedMinutes == null || !dogId || !ticketId) return;
    const dateKey = toDateKey(selectedDate);
    saveReserveDraft({ dogId, ticketId, dateKey, minutes: selectedMinutes });
    push({
      pathname: route.reservation.confirm.root,
      query: { dogId, ticketId, date: dateKey, minutes: String(selectedMinutes) },
    }).catch(() => undefined);
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
        {ticket && placeName ? (
          <div className='bg-fill-primary-50 px-x4 py-x3 gap-x3 flex items-center'>
            <p className='body2-regular text-text-secondary shrink-0'>{copy.selectedLabel}</p>
            <p className='body2-semibold text-text-primary truncate'>
              {formatSelectedPass(
                placeName,
                ticket.totalCount,
                remainingAfterUses(ticket.remainingCount, countTicketUses(visits, ticket.id))
              )}
            </p>
          </div>
        ) : null}

        <RsvMonthlyCalendar
          month={month}
          onMonthChange={setMonth}
          value={selectedDate ?? undefined}
          onValueChange={handleSelectDate}
          today={now}
          reservedDates={reservedDates}
          disabledDates={disabledDates}
        />
        <p className='caption1-regular text-text-tertiary gap-x1 px-x5 pb-x2 flex items-center justify-end'>
          <span className='bg-fill-primary-500 size-1.5 shrink-0 rounded-full' />
          {copy.legend}
        </p>

        {slots ? (
          <div className='px-x4 py-x5 gap-x6 flex flex-col'>
            <RsvTimetable
              period={copy.morning}
              slots={toTimetableSlots(slots.morning, selectedMinutes, handleSelectMinutes)}
            />
            <RsvTimetable
              period={copy.afternoon}
              slots={toTimetableSlots(slots.afternoon, selectedMinutes, handleSelectMinutes)}
            />
          </div>
        ) : null}
      </div>

      <div className='bg-bg-0 px-x4 py-x4 gap-x3 flex shrink-0 flex-col'>
        <div className='gap-x3 flex items-center'>
          <RsvDateTime type='date' isFilled={selectedDate != null}>
            {selectedDate ? formatReserveDay(selectedDate) : undefined}
          </RsvDateTime>
          <RsvDateTime type='time' isFilled={selectedMinutes != null}>
            {selectedMinutes != null ? formatReserveClock(selectedMinutes) : undefined}
          </RsvDateTime>
        </div>
        {isReservedDay ? <p className='caption1-regular text-error'>{copy.reservedNotice}</p> : null}
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          className='body1-bold'
          disabled={!canContinue}
          onClick={handleNext}
        >
          {copy.next}
        </ActionButton>
      </div>
    </div>
  );
}

export { GuardianReservationTimePage };

'use client';

import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

import { ActionButton, RsvDateTime, RsvMonthlyCalendar, RsvTimetable } from '@knockdog/ui';

import { RESERVATION_TIME_COPY } from '@views/guardian-reservation-page/config/guardianReservationTime';
import { leaveReservationTab } from '@views/guardian-reservation-page/lib/leaveReservationTab';
import { toDateKey, type ReservationKindergarten } from '@views/guardian-reservation-page/lib/guardianReservationMain';
import {
  dateFromKey,
  formatReserveClock,
  formatReserveDay,
  formatSelectedPass,
  isOwnerHoursUnset,
} from '@views/guardian-reservation-page/lib/guardianReservationSchedule';
import { GuardianReservationHoursPage } from '@views/guardian-reservation-page/ui/GuardianReservationHoursPage';
import {
  clearReserveDraft,
  readReserveDraft,
  saveReserveDraft,
} from '@views/guardian-reservation-page/model/reserveDraft';

import { Header } from '@widgets/Header';

import { useReservationCalendarQuery, useReservationSlotsQuery } from '@entities/guardian-reservation';
import { useGuardianHomeQuery } from '@entities/guardian-home';
import { useGuardianTicketCardQuery } from '@entities/guardian-ticket';
import { useUserStore } from '@entities/user';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

const NOON_MINUTES = 12 * 60;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthDates(month: Date) {
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1));
}

function isMonthOpen(month: Date, today: Date) {
  const target = new Date(month.getFullYear(), month.getMonth(), 1).getTime();
  const min = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const max = new Date(today.getFullYear(), today.getMonth() + 12, 1).getTime();
  return target >= min && target <= max;
}

function slotLabel(time: string) {
  const [hourText = '0', minute = '00'] = time.split(':');
  const hour = Number(hourText);
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, '0')}:${minute}`;
}

function slotState(minutes: number, selectedMinutes: number | null, isAvailable: boolean) {
  if (minutes === selectedMinutes) return 'selected' as const;
  if (!isAvailable) return 'disabled' as const;
  return 'default' as const;
}

function numericId(value: string) {
  return /^\d+$/.test(value) ? value : '';
}

function ReservationTimeBack({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  useNativeBackHandler(onBack);
  return children;
}

function toHoursKindergarten(
  homeSchool: { placeId: string | null; name: string; address: string; imageUrl: string } | null | undefined,
  ticketSchool: { name: string; address: string; imageUrl?: string } | null | undefined,
  schoolName: string | null | undefined
): ReservationKindergarten | null {
  if (homeSchool) {
    return {
      placeId: homeSchool.placeId ?? '',
      name: homeSchool.name,
      address: homeSchool.address,
      phone: '',
      imageUrl: homeSchool.imageUrl,
    };
  }
  if (ticketSchool) {
    return {
      placeId: '',
      name: ticketSchool.name,
      address: ticketSchool.address,
      phone: '',
      imageUrl: ticketSchool.imageUrl,
    };
  }
  if (schoolName) return { placeId: '', name: schoolName, address: '', phone: '' };
  return null;
}

function GuardianReservationTimePage() {
  const copy = RESERVATION_TIME_COPY;
  const searchParams = useSearchParams();
  const dogId = searchParams.get('dogId') ?? '';
  const ticketId = searchParams.get('ticketId') ?? '';
  const petId = numericId(dogId);
  const selectedTicketId = numericId(ticketId);
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const [today] = useState(() => new Date());
  const draft = readReserveDraft(dogId, ticketId);
  const restoredDate = draft ? dateFromKey(draft.dateKey) : null;
  const [month, setMonth] = useState(() => {
    const base = restoredDate ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(restoredDate);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(draft?.minutes ?? null);
  const homeQuery = useGuardianHomeQuery({ userId, petId, enabled: Boolean(petId) });
  const calendarQuery = useReservationCalendarQuery(petId, monthKey(month), selectedTicketId);
  const calendar = calendarQuery.data;
  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : '';
  const slotsQuery = useReservationSlotsQuery(petId, selectedDateKey, selectedTicketId);
  const slots = slotsQuery.data;
  const ticketQuery = useGuardianTicketCardQuery(petId);
  const ticket = ticketQuery.data?.tickets.find((item) => item.id === selectedTicketId);
  const selectedDay = calendar?.days.find((day) => day.date === selectedDateKey) ?? null;
  const isReservedDay = Boolean(selectedDay?.reservationId || slots?.reservationId);
  const selectedSlot = slots?.slots.find((slot) => slot.minutes === selectedMinutes) ?? null;
  const canContinue = Boolean(selectedDate && selectedSlot?.isAvailable && slots?.isSelectable && !isReservedDay);
  const disabledDates =
    calendar?.isReservable === true
      ? calendar.days.filter((day) => !day.isSelectable).map((day) => dateFromKey(day.date))
      : monthDates(month);
  const reservedDates = (calendar?.days ?? []).filter((day) => day.reservationId).map((day) => dateFromKey(day.date));
  const morning = (slots?.slots ?? []).filter((slot) => slot.minutes < NOON_MINUTES);
  const afternoon = (slots?.slots ?? []).filter((slot) => slot.minutes >= NOON_MINUTES);

  const handleBack = () => {
    clearReserveDraft();
    leaveReservationTab(back, navigateToTab);
  };

  const handleMonthChange = (nextMonth: Date) => {
    if (!isMonthOpen(nextMonth, today)) return;
    setMonth(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
  };

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

  const toSlots = (items: typeof morning) =>
    items.map((slot) => ({
      time: slotLabel(slot.time),
      state: slotState(slot.minutes, selectedMinutes, slot.isAvailable),
      isReserved: selectedDay?.reservationTime === slot.time,
      onSelect: slot.isAvailable ? () => handleSelectMinutes(slot.minutes) : undefined,
    }));

  if (calendarQuery.isPending && !calendar) {
    return (
      <ReservationTimeBack onBack={handleBack}>
        <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
          <Header>
            <Header.LeftSection>
              <Header.BackButton onClick={handleBack} />
            </Header.LeftSection>
            <Header.Title>{copy.title}</Header.Title>
          </Header>
          <DelayedLoadingSpinner isLoading layout='content' className='py-10' />
        </div>
      </ReservationTimeBack>
    );
  }

  if (isOwnerHoursUnset(calendar?.reason)) {
    return (
      <GuardianReservationHoursPage
        kindergarten={toHoursKindergarten(homeQuery.data?.school, ticketQuery.data?.school, calendar?.schoolName)}
      />
    );
  }

  return (
    <ReservationTimeBack onBack={handleBack}>
      <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{copy.title}</Header.Title>
        </Header>

        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
          {ticket && calendar?.schoolName ? (
            <div className='bg-fill-primary-50 px-x4 py-x3 gap-x3 flex items-center'>
              <p className='body2-regular text-text-secondary shrink-0'>{copy.selectedLabel}</p>
              <p className='body2-semibold text-text-primary truncate'>
                {formatSelectedPass(calendar.schoolName, ticket.totalCount, ticket.remainingCount)}
              </p>
            </div>
          ) : null}

          {calendarQuery.isError ? (
            <p className='body2-regular text-text-secondary px-x4 py-x3 text-center'>{copy.loadError}</p>
          ) : null}

          <RsvMonthlyCalendar
            month={month}
            onMonthChange={handleMonthChange}
            value={selectedDate ?? undefined}
            onValueChange={handleSelectDate}
            today={today}
            reservedDates={reservedDates}
            disabledDates={disabledDates}
          />
          <p className='caption1-regular text-text-tertiary gap-x1 px-x5 pb-x2 flex items-center justify-end'>
            <span className='bg-fill-primary-500 size-1.5 shrink-0 rounded-full' />
            {copy.legend}
          </p>

          {selectedDate ? (
            slotsQuery.isLoading ? (
              <DelayedLoadingSpinner isLoading layout='content' className='py-6' />
            ) : slotsQuery.isError ? (
              <p className='body2-regular text-text-secondary px-x4 py-x6 text-center'>{copy.slotError}</p>
            ) : (
              <div className='px-x4 py-x5 gap-x6 flex flex-col'>
                {morning.length > 0 ? <RsvTimetable period={copy.morning} slots={toSlots(morning)} /> : null}
                {afternoon.length > 0 ? <RsvTimetable period={copy.afternoon} slots={toSlots(afternoon)} /> : null}
              </div>
            )
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
    </ReservationTimeBack>
  );
}

export { GuardianReservationTimePage };

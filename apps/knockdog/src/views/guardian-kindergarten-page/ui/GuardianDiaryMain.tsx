'use client';

import { useEffect, useMemo, useState } from 'react';
import { overlay } from 'overlay-kit';
import { DiaryCalendar, DiaryCalendarBanner, DiaryThumbnail, Divider } from '@knockdog/ui';

import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import {
  DIARY_CREDIT_LIMIT,
  alignDiaryDateToMonth,
  findDiaryEntry,
  formatDiaryWeekday,
  resolveDiaryDayKind,
  type GuardianDiaryEntry,
} from '@views/guardian-kindergarten-page/lib/resolveGuardianDiaryDay';
import { isSameDay, startOfDay } from '@shared/lib/calendar-date';

interface GuardianDiaryMainProps {
  dogName?: string;
  petId?: string | null;
  entries?: GuardianDiaryEntry[];
  remainingCredits?: number;
  today?: Date;
}

function GuardianDiaryMain({
  dogName = '강아지',
  petId = null,
  entries = [],
  remainingCredits = DIARY_CREDIT_LIMIT,
  today: todayProp,
}: GuardianDiaryMainProps) {
  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const minMonth = useMemo(() => new Date(today.getFullYear() - 5, today.getMonth(), 1), [today]);
  const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const selectedEntry = findDiaryEntry(entries, selectedDate);
  const dayKind = resolveDiaryDayKind(Boolean(selectedEntry), isSameDay(selectedDate, today), remainingCredits);

  useEffect(() => {
    setSelectedDate(today);
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [petId, today]);

  function handleMonthChange(nextMonth: Date) {
    setMonth(nextMonth);
    setSelectedDate((current) => alignDiaryDateToMonth(nextMonth, current, today));
  }

  function handleYearMonthClick() {
    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumMonthPickerSheet
        isOpen={isOpen}
        close={close}
        currentMonth={month}
        minMonth={minMonth}
        maxMonth={maxMonth}
        onConfirm={handleMonthChange}
      />
    ));
  }

  return (
    <section className='flex w-full flex-col'>
      <DiaryCalendar
        value={selectedDate}
        onValueChange={setSelectedDate}
        month={month}
        onMonthChange={handleMonthChange}
        onYearMonthClick={handleYearMonthClick}
        today={today}
        getImage={(date) => {
          const imageSrc = findDiaryEntry(entries, date)?.imageSrc;
          if (!imageSrc) return undefined;
          return <img src={imageSrc} alt='' className='size-full object-cover' />;
        }}
      />
      <Divider />
      <div className='gap-x5 px-x4 pt-x7 pb-x5 flex items-start'>
        <div className='py-x1 flex w-10 shrink-0 flex-col items-center gap-1.5 text-center'>
          <p className='text-text-accent text-[36px] leading-7 font-bold tracking-[-0.72px]'>{selectedDate.getDate()}</p>
          <p className='caption1-semibold text-text-primary'>{formatDiaryWeekday(selectedDate)}</p>
        </div>
        <div className='min-w-0 flex-1'>
          {dayKind === 'written' && selectedEntry ? (
            <DiaryThumbnail
              title={selectedEntry.title}
              body={selectedEntry.body}
              photoCount={Math.min(Math.max(selectedEntry.photoCount, 1), 3)}
              image={
                selectedEntry.imageSrc ? (
                  <img src={selectedEntry.imageSrc} alt='' className='size-full object-cover' />
                ) : undefined
              }
            />
          ) : (
            <DiaryCalendarBanner
              state={dayKind === 'spent' ? 'disabled' : dayKind}
              dogName={dogName}
              className='w-full'
            />
          )}
        </div>
      </div>
    </section>
  );
}

export { GuardianDiaryMain };
export type { GuardianDiaryMainProps };

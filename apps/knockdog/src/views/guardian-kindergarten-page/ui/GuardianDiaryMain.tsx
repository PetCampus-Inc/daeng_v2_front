'use client';

import { useEffect, useMemo, useState } from 'react';
import { overlay } from 'overlay-kit';
import { DiaryCalendar, DiaryCalendarBanner, DiaryThumbnail, Divider } from '@knockdog/ui';

import { useGuardianDiaryDateQuery, useGuardianDiaryMonthQuery, type DiaryDateSummary } from '@entities/guardian-diary';

import { GuardianAlbumMonthPickerSheet } from '@views/guardian-album-page/ui/GuardianAlbumMonthPickerSheet';
import {
  DIARY_CREDIT_LIMIT,
  alignDiaryDateToMonth,
  findDiaryEntry,
  formatDiaryWeekday,
  resolveDiaryDayKind,
  type GuardianDiaryEntry,
} from '@views/guardian-kindergarten-page/lib/resolveGuardianDiaryDay';
import { formatDateKey, isSameDay, startOfDay } from '@shared/lib/calendar-date';
import { DIARY_RECORD_EVENT, takeDiaryHomeDate } from '@shared/lib/diary-write/diaryRecord';

function formatYearMonth(date: Date) {
  const monthText = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${monthText}`;
}

function parseDiaryHomeDate(dateKey: string | null) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [yearText, monthText, dayText] = dateKey.split('-');
  return startOfDay(new Date(Number(yearText), Number(monthText) - 1, Number(dayText)));
}

interface GuardianDiaryMainProps {
  dogName?: string;
  petId?: string | null;
  entries?: GuardianDiaryEntry[];
  remainingCredits?: number;
  today?: Date;
  onWrite?: (date: Date) => void;
  onView?: (date: Date, diaryId?: string) => void;
}

function GuardianDiaryMain({
  dogName = '강아지',
  petId = null,
  entries = [],
  remainingCredits = DIARY_CREDIT_LIMIT,
  today: todayProp,
  onWrite,
  onView,
}: GuardianDiaryMainProps) {
  const today = useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp]);
  const restoredDate = useMemo(() => parseDiaryHomeDate(takeDiaryHomeDate()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const minMonth = useMemo(() => new Date(today.getFullYear() - 5, today.getMonth(), 1), [today]);
  const maxMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const selectedDateKey = formatDateKey(selectedDate);
  const { data: dateStatus } = useGuardianDiaryDateQuery({ petId, date: selectedDateKey });
  const { data: monthDays } = useGuardianDiaryMonthQuery({ petId, yearMonth: formatYearMonth(month) });
  const [visitedDiaries, setVisitedDiaries] = useState<Record<string, DiaryDateSummary>>({});
  const monthDay = monthDays?.find((day) => day.date === selectedDateKey);
  const sessionEntry = findDiaryEntry(entries, selectedDate);
  const apiEntry = dateStatus?.diary
    ? {
        dateKey: selectedDateKey,
        title: dateStatus.diary.title,
        body: dateStatus.diary.body,
        photoCount: dateStatus.diary.photoCount,
        imageSrc: dateStatus.diary.thumbnailUrl,
      }
    : null;
  const monthEntry = monthDay
    ? {
        dateKey: selectedDateKey,
        title: sessionEntry?.title ?? '',
        body: sessionEntry?.body ?? '',
        photoCount: monthDay.photoCount,
        imageSrc: monthDay.thumbnailUrl,
      }
    : null;
  const selectedEntry = apiEntry ?? monthEntry ?? (monthDays ? null : sessionEntry);
  const selectedDiaryId = dateStatus?.diary?.id ?? monthDay?.id;
  const reportedCredits = dateStatus?.remainingGenerations ?? remainingCredits;
  const credits = dateStatus?.blockedReason === 'LIMIT_REACHED' || reportedCredits <= 0 ? 0 : reportedCredits;
  const dayKind = resolveDiaryDayKind(Boolean(selectedEntry), isSameDay(selectedDate, today), credits);

  useEffect(() => {
    const diary = dateStatus?.diary;
    if (!diary) return;
    setVisitedDiaries((current) => ({ ...current, [selectedDateKey]: diary }));
  }, [dateStatus, selectedDateKey]);

  useEffect(() => {
    const next = restoredDate ?? today;
    setSelectedDate(next);
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  }, [petId, restoredDate, today]);

  useEffect(() => {
    function applyHomeDate() {
      const next = parseDiaryHomeDate(takeDiaryHomeDate());
      if (!next) return;
      setSelectedDate(next);
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    window.addEventListener(DIARY_RECORD_EVENT, applyHomeDate);
    return () => window.removeEventListener(DIARY_RECORD_EVENT, applyHomeDate);
  }, []);

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
          const dateKey = formatDateKey(date);
          const monthImage = monthDays?.find((day) => day.date === dateKey)?.thumbnailUrl;
          const imageSrc = monthImage ?? (monthDays ? undefined : visitedDiaries[dateKey]?.thumbnailUrl ?? findDiaryEntry(entries, date)?.imageSrc);
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
              onViewAll={
                onView ? () => (selectedDiaryId ? onView(selectedDate, selectedDiaryId) : onView(selectedDate)) : undefined
              }
            />
          ) : (
            <DiaryCalendarBanner
              state={dayKind === 'past' ? 'past' : dayKind === 'spent' ? 'disabled' : 'today'}
              dogName={dogName}
              className='w-full'
              onClick={onWrite ? () => onWrite(selectedDate) : undefined}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export { GuardianDiaryMain };
export type { GuardianDiaryMainProps };

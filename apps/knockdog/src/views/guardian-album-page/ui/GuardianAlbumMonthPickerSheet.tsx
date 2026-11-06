'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActionButton } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { compareYearMonth } from '@views/guardian-album-page/config/guardianAlbumMonthMock';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useNativeBackToClose } from '@shared/lib/bridge';

const ITEM_HEIGHT = 56;

interface PickerOption {
  value: number;
  label: string;
}

interface GuardianAlbumMonthPickerColumnProps {
  options: PickerOption[];
  value: number;
  onChange: (value: number) => void;
  'aria-label': string;
}

function GuardianAlbumMonthPickerColumn({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: GuardianAlbumMonthPickerColumnProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToValue = useCallback(
    (nextValue: number, behavior: ScrollBehavior = 'auto') => {
      const node = listRef.current;
      if (!node) return;
      const index = options.findIndex((option) => option.value === nextValue);
      if (index < 0) return;
      node.scrollTo({ top: index * ITEM_HEIGHT, behavior });
    },
    [options]
  );

  useEffect(() => {
    scrollToValue(value);
  }, [scrollToValue, value, options]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, []);

  const handleScroll = () => {
    const node = listRef.current;
    if (!node) return;

    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);

    scrollEndTimerRef.current = setTimeout(() => {
      const index = Math.round(node.scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.min(Math.max(index, 0), Math.max(options.length - 1, 0));
      const next = options[clampedIndex];
      if (!next) return;

      node.scrollTo({ top: clampedIndex * ITEM_HEIGHT, behavior: 'smooth' });
      if (next.value !== value) onChange(next.value);
    }, 80);
  };

  return (
    <div className='relative h-[168px] flex-1 overflow-hidden'>
      <div
        ref={listRef}
        className='h-full snap-y snap-mandatory overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        aria-label={ariaLabel}
        onScroll={handleScroll}
      >
        <div style={{ height: ITEM_HEIGHT }} aria-hidden='true' />
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type='button'
              className='flex h-[56px] w-full snap-center items-center justify-center px-4'
              onClick={() => {
                onChange(option.value);
                scrollToValue(option.value, 'smooth');
              }}
            >
              <span
                className={cn(
                  'body1-medium',
                  isSelected ? 'text-text-accent' : 'text-text-tertiary'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
        <div style={{ height: ITEM_HEIGHT }} aria-hidden='true' />
      </div>
    </div>
  );
}

interface GuardianAlbumMonthPickerSheetProps {
  isOpen: boolean;
  close: () => void;
  currentMonth: Date;
  minMonth: Date;
  maxMonth: Date;
  onConfirm: (month: Date) => void;
}

function getYearOptions(minMonth: Date, maxMonth: Date): PickerOption[] {
  const { monthPickerSheet } = guardianAlbumContent;
  const years: PickerOption[] = [];
  for (let year = minMonth.getFullYear(); year <= maxMonth.getFullYear(); year += 1) {
    years.push({ value: year, label: monthPickerSheet.yearLabel(year) });
  }
  return years;
}

function getMonthOptions(year: number, minMonth: Date, maxMonth: Date): PickerOption[] {
  const { monthPickerSheet } = guardianAlbumContent;
  const startMonth = year === minMonth.getFullYear() ? minMonth.getMonth() + 1 : 1;
  const endMonth = year === maxMonth.getFullYear() ? maxMonth.getMonth() + 1 : 12;
  const months: PickerOption[] = [];

  for (let month = startMonth; month <= endMonth; month += 1) {
    months.push({ value: month, label: monthPickerSheet.monthLabel(month) });
  }
  return months;
}

function clampMonthValue(year: number, month: number, minMonth: Date, maxMonth: Date) {
  const candidate = new Date(year, month - 1, 1);
  if (compareYearMonth(candidate, minMonth) < 0) return minMonth.getMonth() + 1;
  if (compareYearMonth(candidate, maxMonth) > 0) return maxMonth.getMonth() + 1;
  return month;
}

function GuardianAlbumMonthPickerSheet({
  isOpen,
  close,
  currentMonth,
  minMonth,
  maxMonth,
  onConfirm,
}: GuardianAlbumMonthPickerSheetProps) {
  const { monthPickerSheet, monthNav } = guardianAlbumContent;
  const [draftYear, setDraftYear] = useState(currentMonth.getFullYear());
  const [draftMonth, setDraftMonth] = useState(currentMonth.getMonth() + 1);

  useEffect(() => {
    if (!isOpen) return;
    setDraftYear(currentMonth.getFullYear());
    setDraftMonth(currentMonth.getMonth() + 1);
  }, [isOpen, currentMonth]);

  const yearOptions = useMemo(() => getYearOptions(minMonth, maxMonth), [minMonth, maxMonth]);
  const monthOptions = useMemo(
    () => getMonthOptions(draftYear, minMonth, maxMonth),
    [draftYear, minMonth, maxMonth]
  );

  useEffect(() => {
    const nextMonth = clampMonthValue(draftYear, draftMonth, minMonth, maxMonth);
    if (nextMonth !== draftMonth) setDraftMonth(nextMonth);
  }, [draftYear, draftMonth, minMonth, maxMonth]);

  useNativeBackToClose(isOpen, close);

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleYearChange = (year: number) => {
    setDraftYear(year);
    setDraftMonth((prev) => clampMonthValue(year, prev, minMonth, maxMonth));
  };

  const handleConfirm = () => {
    onConfirm(new Date(draftYear, draftMonth - 1, 1));
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal' aria-label={monthNav.yearMonthAriaLabel}>
        <BottomSheet.Handle />
        <BottomSheet.Title className='sr-only'>{monthNav.yearMonthAriaLabel}</BottomSheet.Title>

        <div className='relative py-5'>
          <div className='border-line-100 pointer-events-none absolute inset-x-4 top-1/2 h-[56px] -translate-y-1/2 border-y' />
          <div className='flex items-center gap-4 px-4'>
            <GuardianAlbumMonthPickerColumn
              options={yearOptions}
              value={draftYear}
              onChange={handleYearChange}
              aria-label='연도'
            />
            <GuardianAlbumMonthPickerColumn
              options={monthOptions}
              value={draftMonth}
              onChange={setDraftMonth}
              aria-label='월'
            />
          </div>
        </div>

        <div className='px-4 pt-0 pb-[calc(1.25rem+var(--safe-area-inset-bottom,0px))]'>
          <ActionButton type='button' variant='secondaryFill' size='large' onClick={handleConfirm}>
            {monthPickerSheet.confirmLabel}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianAlbumMonthPickerSheet };

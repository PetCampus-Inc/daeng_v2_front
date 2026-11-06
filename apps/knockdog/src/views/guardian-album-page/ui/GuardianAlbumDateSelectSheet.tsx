'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import {
  formatDateKey,
  isAfterDay,
  isBeforeDay,
  startOfDay,
} from '@shared/lib/calendar-date';
import { MonthlyDatePicker } from '@shared/ui/monthly-date-picker';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useNativeBackToClose } from '@shared/lib/bridge';

interface GuardianAlbumDateSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  minDate: Date;
  maxDate: Date;
  initialDate: Date;
  /** 사진이 있는 날짜만 선택 가능. 없으면 min/max만 적용 */
  enabledDateKeys?: Set<string>;
  markedDateKeys?: Set<string>;
  onConfirm: (date: Date) => void;
}

function clampDate(date: Date, minDate: Date, maxDate: Date) {
  if (isBeforeDay(date, minDate)) return startOfDay(minDate);
  if (isAfterDay(date, maxDate)) return startOfDay(maxDate);
  return startOfDay(date);
}

function resolveSelectableDate(
  date: Date,
  minDate: Date,
  maxDate: Date,
  enabledDateKeys?: Set<string>
) {
  const clamped = clampDate(date, minDate, maxDate);
  if (!enabledDateKeys || enabledDateKeys.size === 0) return clamped;
  if (enabledDateKeys.has(formatDateKey(clamped))) return clamped;

  const enabledDates = [...enabledDateKeys]
    .map((key) => {
      const [yearPart, monthPart, dayPart] = key.split('-');
      return startOfDay(new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart)));
    })
    .filter((item) => !isBeforeDay(item, minDate) && !isAfterDay(item, maxDate))
    .sort((a, b) => b.getTime() - a.getTime());

  return enabledDates[0] ?? clamped;
}

function GuardianAlbumDateSelectSheet({
  isOpen,
  close,
  minDate,
  maxDate,
  initialDate,
  enabledDateKeys,
  markedDateKeys,
  onConfirm,
}: GuardianAlbumDateSelectSheetProps) {
  const { dateSelectSheet } = guardianAlbumContent;
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(() =>
    resolveSelectableDate(initialDate, minDate, maxDate, enabledDateKeys)
  );
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  );

  useEffect(() => {
    if (!isOpen) return;
    const next = resolveSelectableDate(initialDate, minDate, maxDate, enabledDateKeys);
    setSelectedDate(next);
    setViewMonth(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
  }, [isOpen, initialDate, minDate, maxDate, enabledDateKeys]);

  useNativeBackToClose(isOpen, close);

  const canConfirm =
    enabledDateKeys == null || enabledDateKeys.has(formatDateKey(selectedDate));

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelectDate = (date: Date) => {
    if (enabledDateKeys && !enabledDateKeys.has(formatDateKey(date))) return;
    const next = clampDate(date, minDate, maxDate);
    setSelectedDate(next);
    setViewMonth(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
  };

  const handleGoToday = () => {
    if (enabledDateKeys && !enabledDateKeys.has(formatDateKey(today))) {
      setViewMonth(startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)));
      return;
    }
    handleSelectDate(today);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(selectedDate);
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>{dateSelectSheet.title}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <MonthlyDatePicker
          selectedDate={selectedDate}
          viewMonth={viewMonth}
          today={today}
          minDate={minDate}
          maxDate={maxDate}
          enabledDateKeys={enabledDateKeys}
          markedDateKeys={markedDateKeys}
          todayButtonLabel={dateSelectSheet.todayButtonLabel}
          showCollapse={false}
          onChangeViewMonth={(month) => {
            const minMonth = startOfDay(new Date(minDate.getFullYear(), minDate.getMonth(), 1));
            const maxMonth = startOfDay(new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));
            if (isBeforeDay(month, minMonth) || isAfterDay(month, maxMonth)) return;
            setViewMonth(startOfDay(new Date(month.getFullYear(), month.getMonth(), 1)));
          }}
          onSelectDate={handleSelectDate}
          onGoToday={handleGoToday}
        />

        <div className='px-4 pt-8 pb-[calc(1.25rem+var(--safe-area-inset-bottom,0px))]'>
          <ActionButton
            type='button'
            variant='primaryFill'
            size='large'
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {dateSelectSheet.confirmLabel(selectedDate)}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianAlbumDateSelectSheet };

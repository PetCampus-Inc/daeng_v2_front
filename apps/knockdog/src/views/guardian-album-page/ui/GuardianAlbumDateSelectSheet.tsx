'use client';

import { useEffect, useMemo, useState } from 'react';
import { ActionButton } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import {
  isAfterDay,
  isBeforeDay,
  startOfDay,
} from '@shared/lib/calendar-date';
import { MonthlyDatePicker } from '@shared/ui/monthly-date-picker';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface GuardianAlbumDateSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  minDate: Date;
  maxDate: Date;
  initialDate: Date;
  markedDateKeys?: Set<string>;
  onConfirm: (date: Date) => void;
}

function clampDate(date: Date, minDate: Date, maxDate: Date) {
  if (isBeforeDay(date, minDate)) return startOfDay(minDate);
  if (isAfterDay(date, maxDate)) return startOfDay(maxDate);
  return startOfDay(date);
}

function GuardianAlbumDateSelectSheet({
  isOpen,
  close,
  minDate,
  maxDate,
  initialDate,
  markedDateKeys,
  onConfirm,
}: GuardianAlbumDateSelectSheetProps) {
  const { dateSelectSheet } = guardianAlbumContent;
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(() =>
    clampDate(initialDate, minDate, maxDate)
  );
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  );

  useEffect(() => {
    if (!isOpen) return;
    const next = clampDate(initialDate, minDate, maxDate);
    setSelectedDate(next);
    setViewMonth(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
  }, [isOpen, initialDate, minDate, maxDate]);

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelectDate = (date: Date) => {
    const next = clampDate(date, minDate, maxDate);
    setSelectedDate(next);
    setViewMonth(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
  };

  const handleGoToday = () => {
    handleSelectDate(today);
  };

  const handleConfirm = () => {
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

        <div className='px-4 pt-8 pb-5'>
          <ActionButton type='button' variant='primaryFill' size='large' onClick={handleConfirm}>
            {dateSelectSheet.confirmLabel(selectedDate)}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianAlbumDateSelectSheet };

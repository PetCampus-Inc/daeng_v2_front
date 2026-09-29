'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { ActionButton } from '@knockdog/ui';

import {
  formatKstDateLabel,
  formatKstDayLabel,
  isAfterDay,
  isBeforeDay,
  startOfDay,
} from '@shared/lib/calendar-date';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useNativeBackToClose } from '@shared/lib/bridge';

interface OwnerDailyDatePickerSheetProps {
  isOpen: boolean;
  close: () => void;
  minDate: Date;
  maxDate: Date;
  initialDate: Date;
  onConfirm: (date: Date) => void;
}

function clampDate(date: Date, minDate: Date, maxDate: Date) {
  if (isBeforeDay(date, minDate)) return startOfDay(minDate);
  if (isAfterDay(date, maxDate)) return startOfDay(maxDate);
  return startOfDay(date);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getDateWithPartChanged(date: Date, part: 'year' | 'month' | 'day', offset: number) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (part === 'year') {
    const nextYear = year + offset;
    return new Date(nextYear, month, Math.min(day, getDaysInMonth(nextYear, month)));
  }

  if (part === 'month') {
    const nextMonthDate = new Date(year, month + offset, 1);
    return new Date(
      nextMonthDate.getFullYear(),
      nextMonthDate.getMonth(),
      Math.min(day, getDaysInMonth(nextMonthDate.getFullYear(), nextMonthDate.getMonth()))
    );
  }

  const daysInMonth = getDaysInMonth(year, month);
  const nextDay = ((day - 1 + offset + daysInMonth) % daysInMonth) + 1;
  return new Date(year, month, nextDay);
}

interface DateWheelColumnProps {
  part: 'year' | 'month' | 'day';
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  onChange: (part: 'year' | 'month' | 'day', offset: number) => void;
}

function getDatePartLabel(date: Date, part: DateWheelColumnProps['part']) {
  if (part === 'year') return `${date.getFullYear()}년`;
  if (part === 'month') return `${date.getMonth() + 1}월`;
  return `${date.getDate()}일`;
}

function DateWheelColumn({ part, selectedDate, minDate, maxDate, onChange }: DateWheelColumnProps) {
  const dragStartYRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const previousPreviousDate = getDateWithPartChanged(selectedDate, part, -2);
  const previousDate = getDateWithPartChanged(selectedDate, part, -1);
  const nextDate = getDateWithPartChanged(selectedDate, part, 1);
  const nextNextDate = getDateWithPartChanged(selectedDate, part, 2);
  const canGoPreviousPrevious =
    !isBeforeDay(previousPreviousDate, minDate) && !isAfterDay(previousPreviousDate, maxDate);
  const canGoPrevious = !isBeforeDay(previousDate, minDate) && !isAfterDay(previousDate, maxDate);
  const canGoNext = !isBeforeDay(nextDate, minDate) && !isAfterDay(nextDate, maxDate);
  const canGoNextNext = !isBeforeDay(nextNextDate, minDate) && !isAfterDay(nextNextDate, maxDate);

  const changeDate = (offset: -1 | 1) => {
    onChange(part, offset);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    setDragOffset(0);
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStartY = dragStartYRef.current;
    if (dragStartY == null) return;

    const distance = event.clientY - dragStartY;
    if (distance <= -48 && canGoNext) {
      dragStartYRef.current = event.clientY;
      setDragOffset(0);
      changeDate(1);
      return;
    }
    if (distance >= 48 && canGoPrevious) {
      dragStartYRef.current = event.clientY;
      setDragOffset(0);
      changeDate(-1);
      return;
    }

    const minOffset = canGoNext ? -48 : 0;
    const maxOffset = canGoPrevious ? 48 : 0;
    setDragOffset(Math.max(minOffset, Math.min(maxOffset, distance)));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragOffset(0);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (event.deltaY > 0 && canGoNext) changeDate(1);
    if (event.deltaY < 0 && canGoPrevious) changeDate(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp' && canGoPrevious) changeDate(-1);
    if (event.key === 'ArrowDown' && canGoNext) changeDate(1);
  };

  return (
    <div
      role='spinbutton'
      tabIndex={0}
      aria-label={`${part === 'year' ? '연도' : part === 'month' ? '월' : '일'} 선택`}
      aria-valuetext={getDatePartLabel(selectedDate, part)}
      className='z-10 flex h-[152px] flex-1 flex-col touch-none select-none overflow-hidden'
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStartYRef.current = null;
        setDragOffset(0);
        setIsDragging(false);
      }}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <div
        className='flex w-full flex-col gap-1'
        style={{
          transform: `translateY(${-52 + dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 150ms ease-out',
        }}
      >
        <div className={`flex h-12 items-center justify-center ${canGoPreviousPrevious ? '' : 'opacity-0'}`}>
          <span className='h3-medium text-text-tertiary'>{getDatePartLabel(previousPreviousDate, part)}</span>
        </div>
        <div className={`flex h-12 items-center justify-center ${canGoPrevious ? '' : 'opacity-0'}`}>
          <span className='h3-medium text-text-tertiary'>{getDatePartLabel(previousDate, part)}</span>
        </div>
        <div className='flex h-12 items-center justify-center'>
          <span className='h3-extrabold text-text-accent'>{getDatePartLabel(selectedDate, part)}</span>
        </div>
        <div className={`flex h-12 items-center justify-center ${canGoNext ? '' : 'opacity-0'}`}>
          <span className='h3-medium text-text-tertiary'>{getDatePartLabel(nextDate, part)}</span>
        </div>
        <div className={`flex h-12 items-center justify-center ${canGoNextNext ? '' : 'opacity-0'}`}>
          <span className='h3-medium text-text-tertiary'>{getDatePartLabel(nextNextDate, part)}</span>
        </div>
      </div>
    </div>
  );
}

function OwnerDailyDatePickerSheet({
  isOpen,
  close,
  minDate,
  maxDate,
  initialDate,
  onConfirm,
}: OwnerDailyDatePickerSheetProps) {
  const today = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(() => clampDate(initialDate, minDate, maxDate));
  const selectedDateLabel = `${selectedDate.getFullYear() === today.getFullYear() ? '' : `${selectedDate.getFullYear()}년 `}${formatKstDateLabel(selectedDate)} ${formatKstDayLabel(selectedDate)}`;

  useEffect(() => {
    if (!isOpen) return;
    const next = clampDate(initialDate, minDate, maxDate);
    setSelectedDate(next);
  }, [isOpen, initialDate, minDate, maxDate]);

  useNativeBackToClose(isOpen, close);

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelectDate = (date: Date) => {
    const next = clampDate(date, minDate, maxDate);
    setSelectedDate(next);
  };

  const handleChangeDatePart = (part: DateWheelColumnProps['part'], offset: number) => {
    handleSelectDate(getDateWithPartChanged(selectedDate, part, offset));
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose} handleOnly>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal flex h-[368px] max-h-[calc(100dvh-32px)] flex-col rounded-t-[20px]'>
        <BottomSheet.Handle className='mt-3 mb-4 h-1 w-9' />
        <BottomSheet.Header className='h-[54px] shrink-0 px-4 py-[14px]'>
          <BottomSheet.Title>날짜 선택</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='relative flex h-[152px] w-full shrink-0 items-start gap-0 px-4'>
          <div className='bg-[#FFF7EC] absolute top-[51px] right-4 left-4 h-[50px] rounded-lg' />
          <DateWheelColumn
            part='year'
            selectedDate={selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={handleChangeDatePart}
          />
          <DateWheelColumn
            part='month'
            selectedDate={selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={handleChangeDatePart}
          />
          <DateWheelColumn
            part='day'
            selectedDate={selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onChange={handleChangeDatePart}
          />
        </div>

        <div className='flex h-24 shrink-0 flex-col px-4 py-5'>
          <ActionButton type='button' variant='primaryFill' size='large' onClick={handleConfirm}>
            {`${selectedDateLabel} 확인`}
          </ActionButton>
        </div>
        <div className='min-h-[34px] shrink-0 flex-1 bg-bg-0' />
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerDailyDatePickerSheet };

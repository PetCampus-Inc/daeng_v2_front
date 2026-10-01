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

function DateWheelColumn({
  part,
  selectedDate,
  minDate,
  maxDate,
  onChange,
}: DateWheelColumnProps) {
  const rowHeight = 52;
  const maxVisibleOffset = 15;
  const dragStartYRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const tappedDateOffsetRef = useRef<number | null>(null);
  const queuedTapRef = useRef(false);
  const pendingChangeRef = useRef<number | null>(null);
  const pendingTargetDateRef = useRef<Date | null>(null);
  const queuedChangeOffsetsRef = useRef<number[]>([]);
  const pendingSelectedDateRef = useRef<number | null>(null);
  const transitionFallbackRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDateChanging, setIsDateChanging] = useState(false);
  const [isRebasing, setIsRebasing] = useState(false);
  const [wheelBaseDate, setWheelBaseDate] = useState(selectedDate);
  const baseDate = isDateChanging ? wheelBaseDate : selectedDate;
  const wheelOffsets = Array.from({ length: maxVisibleOffset * 2 + 1 }, (_, index) => index - maxVisibleOffset);
  const getOffsetLimit = (direction: -1 | 1) => {
    let limit = 0;
    for (let step = 1; step <= maxVisibleOffset; step += 1) {
      const date = getDateWithPartChanged(baseDate, part, direction * step);
      if (isBeforeDay(date, minDate) || isAfterDay(date, maxDate)) break;
      limit = step;
    }
    return limit;
  };
  const previousLimit = getOffsetLimit(-1);
  const nextLimit = getOffsetLimit(1);
  const canGoPrevious = previousLimit > 0;
  const canGoNext = nextLimit > 0;

  const changeDate = (offset: number) => {
    if (offset === 0) return;
    onChange(part, offset);
  };

  const clearTransitionFallback = () => {
    if (transitionFallbackRef.current == null) return;
    window.clearTimeout(transitionFallbackRef.current);
    transitionFallbackRef.current = null;
  };

  const completeDateChange = () => {
    clearTransitionFallback();

    const offset = pendingChangeRef.current;
    const nextDate = pendingTargetDateRef.current;
    if (offset == null || nextDate == null) return;

    pendingChangeRef.current = null;
    pendingTargetDateRef.current = null;
    setIsRebasing(true);
    setWheelBaseDate(nextDate);
    dragOffsetRef.current = 0;
    setDragOffset(0);
    const nextOffset = queuedChangeOffsetsRef.current.shift();

    if (nextOffset != null) {
      const queuedDate = getDateWithPartChanged(nextDate, part, nextOffset);
      pendingChangeRef.current = nextOffset;
      pendingTargetDateRef.current = queuedDate;
      pendingSelectedDateRef.current = queuedDate.getTime();
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setIsRebasing(false);
          dragOffsetRef.current = -nextOffset * rowHeight;
          setDragOffset(-nextOffset * rowHeight);
          transitionFallbackRef.current = window.setTimeout(completeDateChange, 200);
        })
      );
      return;
    }

    setIsDateChanging(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setIsRebasing(false)));
  };

  const animateDateChange = (offset: number) => {
    if (offset === 0) return;

    if (pendingChangeRef.current != null) {
      queuedChangeOffsetsRef.current.push(offset);
      changeDate(offset);
      return;
    }

    const nextDate = getDateWithPartChanged(baseDate, part, offset);
    pendingChangeRef.current = offset;
    pendingTargetDateRef.current = nextDate;
    pendingSelectedDateRef.current = nextDate.getTime();
    setIsDateChanging(true);
    changeDate(offset);
    dragOffsetRef.current = -offset * rowHeight;
    setDragOffset(-offset * rowHeight);
    transitionFallbackRef.current = window.setTimeout(completeDateChange, 200);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const tappedDateOffset = (event.target as HTMLElement)
      .closest<HTMLElement>('[data-date-offset]')
      ?.dataset.dateOffset;
    const dateOffset = tappedDateOffset == null ? null : Number(tappedDateOffset);

    if (pendingChangeRef.current != null) {
      queuedTapRef.current = true;
      if (dateOffset != null) animateDateChange(dateOffset);
      return;
    }

    if (pendingSelectedDateRef.current != null) {
      pendingSelectedDateRef.current = null;
      setWheelBaseDate(selectedDate);
    }
    dragStartYRef.current = event.clientY;
    tappedDateOffsetRef.current = dateOffset;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragStartY = dragStartYRef.current;
    if (dragStartY == null) return;

    const distance = event.clientY - dragStartY;
    const minOffset = -nextLimit * rowHeight;
    const maxOffset = previousLimit * rowHeight;
    const nextDragOffset = Math.max(minOffset, Math.min(maxOffset, distance));
    dragOffsetRef.current = nextDragOffset;
    setDragOffset(nextDragOffset);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (queuedTapRef.current) {
      queuedTapRef.current = false;
      return;
    }

    const offset = Math.round(-dragOffsetRef.current / rowHeight);
    const tappedDateOffset = offset === 0 ? tappedDateOffsetRef.current : null;

    dragStartYRef.current = null;
    tappedDateOffsetRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (offset !== 0) {
      animateDateChange(offset);
      return;
    }

    if (tappedDateOffset != null) {
      animateDateChange(tappedDateOffset);
      return;
    }

    dragOffsetRef.current = 0;
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
      aria-valuetext={getDatePartLabel(baseDate, part)}
      className='z-10 flex h-[152px] flex-1 flex-col touch-none select-none overflow-hidden'
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStartYRef.current = null;
        tappedDateOffsetRef.current = null;
        dragOffsetRef.current = 0;
        setDragOffset(0);
        setIsDragging(false);
      }}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
    >
      <div
        className='flex w-full flex-col gap-1'
        onTransitionEnd={(event) => {
          if (event.propertyName !== 'transform') return;
          completeDateChange();
        }}
        style={{
          transform: `translateY(${-maxVisibleOffset * rowHeight + rowHeight + dragOffset}px)`,
          transition: isDragging || isRebasing ? 'none' : 'transform 150ms ease-out',
        }}
      >
        {wheelOffsets.map((offset) => {
          const date = getDateWithPartChanged(baseDate, part, offset);
          const isSelectable = !isBeforeDay(date, minDate) && !isAfterDay(date, maxDate);
          const isSelected = Math.round(-dragOffset / rowHeight) === offset;

          return (
            <div
              key={offset}
              data-date-offset={isSelectable && offset !== 0 ? offset : undefined}
              className={`flex h-12 items-center justify-center ${isSelectable ? '' : 'opacity-0'}`}
            >
              <span className={isSelected ? 'h3-extrabold text-text-accent' : 'h3-medium text-text-tertiary'}>
                {getDatePartLabel(date, part)}
              </span>
            </div>
          );
        })}
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

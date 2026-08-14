'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAttendanceRecordDatesQuery } from '@entities/owner-attendance-record';
import {
  formatDateKey,
  getMonthGridDates,
  getWeekDates,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  resolveSelectableDate,
  startOfDay,
} from '@shared/lib/calendar-date';
import { MonthlyDatePicker } from '@shared/ui/monthly-date-picker';
import { WeeklyDatePicker } from '@shared/ui/weekly-date-picker';
import { formatKstDateKey } from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import { useGuardianCalendarCheckInDateKeys } from '@views/guardian-kindergarten-page/model/useGuardianCalendarCheckInDateKeys';
import { useGuardianSelectedPet } from '@views/guardian-kindergarten-page/model/useGuardianSelectedPet';

interface GuardianKindergartenDateCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /**
   * 외부에서 마커를 직접 넘길 때 (연결 해제 mock 등).
   * 미지정 시 원장과 동일하게 `attendance-records/{petId}/dates` 사용.
   */
  markedDateKeys?: Set<string>;
  /**
   * true면 등원 시각(checkInAt) 있는 날짜만 선택 가능.
   * 알림장 상세에서 미등원일 비활성 처리용.
   */
  onlyCheckInDatesSelectable?: boolean;
  /**
   * 첫 등원일 — 주황 점 하한만 적용.
   * 캘린더 이동/선택 minDate에는 쓰지 않음.
   */
  firstAttendedAt?: Date;
  /** 선택 가능 최대일. 미지정 시 오늘. 연결 해제일 등 */
  maxDate?: Date;
  /** false면 dates API 조회 안 함 (markedDateKeys만 사용) */
  fetchRecordMarks?: boolean;
  /**
   * onlyCheckInDatesSelectable일 때 보이는 구간의 등원 가능 여부.
   * 주간 뷰에서 등원 없는 주 empty 처리용.
   */
  onVisibleCheckInStateChange?: (state: {
    isReady: boolean;
    hasCheckIn: boolean;
    isWeeklyView: boolean;
  }) => void;
}

function getVisibleRecordDateRange(options: {
  isMonthlyExpanded: boolean;
  selectedDate: Date;
  viewMonth: Date;
}) {
  if (options.isMonthlyExpanded) {
    const grid = getMonthGridDates(options.viewMonth);
    return {
      from: formatDateKey(grid[0]!),
      to: formatDateKey(grid[grid.length - 1]!),
      dates: grid,
    };
  }

  const week = getWeekDates(options.selectedDate);
  return {
    from: formatDateKey(week[0]!),
    to: formatDateKey(week[week.length - 1]!),
    dates: week,
  };
}

function filterMarksFromFirstAttend(
  dateKeys: Set<string> | undefined,
  firstAttendKey: string | null
) {
  if (!dateKeys || dateKeys.size === 0) return dateKeys;
  if (!firstAttendKey) return dateKeys;

  const filtered = new Set<string>();
  for (const key of dateKeys) {
    if (key >= firstAttendKey) filtered.add(key);
  }
  return filtered;
}

function GuardianKindergartenDateCalendar({
  selectedDate,
  onSelectDate,
  markedDateKeys: markedDateKeysProp,
  onlyCheckInDatesSelectable = false,
  firstAttendedAt,
  maxDate: maxDateProp,
  fetchRecordMarks = true,
  onVisibleCheckInStateChange,
}: GuardianKindergartenDateCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => startOfDay(new Date(2020, 0, 1)), []);
  const maxDate = useMemo(
    () => startOfDay(maxDateProp ?? today),
    [maxDateProp, today]
  );
  const firstAttendKey = useMemo(
    () => (firstAttendedAt ? formatKstDateKey(firstAttendedAt) : null),
    [firstAttendedAt]
  );

  const { selectedPetId } = useGuardianSelectedPet();
  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  );

  const visibleRange = useMemo(() => {
    const range = getVisibleRecordDateRange({
      isMonthlyExpanded,
      selectedDate,
      viewMonth,
    });

    let nextFrom = range.from;
    const nextTo = range.to;

    if (firstAttendKey && nextFrom < firstAttendKey) {
      nextFrom = firstAttendKey;
    }

    const visibleDateKeys = range.dates
      .filter((date) => {
        const key = formatDateKey(date);
        if (firstAttendKey && key < firstAttendKey) return false;
        if (isBeforeDay(date, minDate)) return false;
        if (isAfterDay(date, maxDate)) return false;
        return true;
      })
      .map((date) => formatDateKey(date));

    return { from: nextFrom, to: nextTo, visibleDateKeys };
  }, [firstAttendKey, isMonthlyExpanded, maxDate, minDate, selectedDate, viewMonth]);

  const { from, to, visibleDateKeys } = visibleRange;
  const isVisibleRangeValid = from <= to;

  const shouldFetchMarks =
    fetchRecordMarks &&
    markedDateKeysProp == null &&
    Boolean(selectedPetId) &&
    isVisibleRangeValid;

  const { data: recordDateSet } = useAttendanceRecordDatesQuery({
    petId: selectedPetId ?? undefined,
    from,
    to,
    enabled: shouldFetchMarks && !onlyCheckInDatesSelectable,
  });

  const { checkInDateKeys, isReady: isCheckInKeysReady } = useGuardianCalendarCheckInDateKeys({
    petId: selectedPetId,
    dateKeys: visibleDateKeys,
    enabled: onlyCheckInDatesSelectable && Boolean(selectedPetId),
  });

  const markedDateKeys = useMemo(() => {
    if (onlyCheckInDatesSelectable && isCheckInKeysReady) {
      return filterMarksFromFirstAttend(checkInDateKeys, firstAttendKey) ?? new Set<string>();
    }
    if (!isVisibleRangeValid && markedDateKeysProp == null) {
      return new Set<string>();
    }
    if (markedDateKeysProp) {
      return filterMarksFromFirstAttend(markedDateKeysProp, firstAttendKey);
    }
    return filterMarksFromFirstAttend(recordDateSet, firstAttendKey);
  }, [
    checkInDateKeys,
    firstAttendKey,
    isCheckInKeysReady,
    isVisibleRangeValid,
    markedDateKeysProp,
    onlyCheckInDatesSelectable,
    recordDateSet,
  ]);

  // 로딩 중엔 제한하지 않고, 준비되면 등원 시각 있는 날만 활성
  const enabledDateKeys =
    onlyCheckInDatesSelectable && isCheckInKeysReady ? checkInDateKeys : undefined;

  const handleSelectDate = (date: Date) => {
    const nextDay = startOfDay(date);
    // enabledDateKeys는 현재 보이는 주/월 조회 결과만 담김.
    // 주 이동으로 그 범위 밖을 고르면 min/max만 적용하고, 스냅은 로드 후 useEffect에서.
    const targetWeekKeys = new Set(getWeekDates(nextDay).map(formatDateKey));
    const enabledCoversTargetWeek =
      enabledDateKeys != null &&
      [...enabledDateKeys].some((key) => targetWeekKeys.has(key));

    const next = resolveSelectableDate(
      nextDay,
      minDate,
      maxDate,
      enabledCoversTargetWeek ? enabledDateKeys : undefined
    );
    onSelectDate(next);
    setViewMonth(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
  };

  useEffect(() => {
    if (!onlyCheckInDatesSelectable || !onVisibleCheckInStateChange) return;
    onVisibleCheckInStateChange({
      isReady: isCheckInKeysReady,
      hasCheckIn: checkInDateKeys.size > 0,
      isWeeklyView: !isMonthlyExpanded,
    });
  }, [
    checkInDateKeys,
    isCheckInKeysReady,
    isMonthlyExpanded,
    onVisibleCheckInStateChange,
    onlyCheckInDatesSelectable,
  ]);

  useEffect(() => {
    if (!onlyCheckInDatesSelectable || !isCheckInKeysReady) return;
    if (!enabledDateKeys || enabledDateKeys.size === 0) return;
    if (enabledDateKeys.has(formatDateKey(selectedDate))) return;

    const next = resolveSelectableDate(selectedDate, minDate, maxDate, enabledDateKeys);
    if (!isSameDay(next, selectedDate)) onSelectDate(next);
  }, [
    enabledDateKeys,
    isCheckInKeysReady,
    maxDate,
    minDate,
    onSelectDate,
    onlyCheckInDatesSelectable,
    selectedDate,
  ]);

  const handleExpandMonthly = () => {
    setViewMonth(startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)));
    setIsMonthlyExpanded(true);
  };

  const handleGoToday = () => {
    handleSelectDate(isAfterDay(today, maxDate) ? maxDate : today);
  };

  if (isMonthlyExpanded) {
    return (
      <MonthlyDatePicker
        selectedDate={selectedDate}
        viewMonth={viewMonth}
        today={today}
        minDate={minDate}
        maxDate={maxDate}
        markedDateKeys={markedDateKeys}
        enabledDateKeys={enabledDateKeys}
        todayButtonLabel='오늘'
        onChangeViewMonth={setViewMonth}
        onSelectDate={handleSelectDate}
        onGoToday={handleGoToday}
        onCollapse={() => setIsMonthlyExpanded(false)}
      />
    );
  }

  return (
    <WeeklyDatePicker
      selectedDate={selectedDate}
      minDate={minDate}
      maxDate={maxDate}
      markedDateKeys={markedDateKeys}
      enabledDateKeys={enabledDateKeys}
      onSelectDate={handleSelectDate}
      onExpandMonthly={handleExpandMonthly}
    />
  );
}

export { GuardianKindergartenDateCalendar };

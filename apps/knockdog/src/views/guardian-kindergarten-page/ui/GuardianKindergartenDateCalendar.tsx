'use client';

import { useMemo, useState } from 'react';

import { useAttendanceRecordDatesQuery } from '@entities/owner-attendance-record';
import {
  formatDateKey,
  getMonthGridDates,
  getWeekDates,
  isAfterDay,
  isBeforeDay,
  startOfDay,
} from '@shared/lib/calendar-date';
import { MonthlyDatePicker } from '@shared/ui/monthly-date-picker';
import { WeeklyDatePicker } from '@shared/ui/weekly-date-picker';
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
   * 첫 등원일 — 주황 점 하한만 적용.
   * 캘린더 이동/선택 minDate에는 쓰지 않음.
   */
  firstAttendedAt?: Date;
  /** 선택 가능 최대일. 미지정 시 오늘. 연결 해제일 등 */
  maxDate?: Date;
  /** false면 dates API 조회 안 함 (markedDateKeys만 사용) */
  fetchRecordMarks?: boolean;
}

/** 화면에 실제로 보이는 날짜 범위 — 월 경계 주/그리드의 인접 달 날짜 포함 */
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
    };
  }

  const week = getWeekDates(options.selectedDate);
  return {
    from: formatDateKey(week[0]!),
    to: formatDateKey(week[week.length - 1]!),
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
  firstAttendedAt,
  maxDate: maxDateProp,
  fetchRecordMarks = true,
}: GuardianKindergartenDateCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => startOfDay(new Date(2020, 0, 1)), []);
  const maxDate = useMemo(
    () => startOfDay(maxDateProp ?? today),
    [maxDateProp, today]
  );
  const firstAttendKey = useMemo(
    () => (firstAttendedAt ? formatDateKey(startOfDay(firstAttendedAt)) : null),
    [firstAttendedAt]
  );

  const { selectedPetId } = useGuardianSelectedPet();
  const [isMonthlyExpanded, setIsMonthlyExpanded] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfDay(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  );

  const { from, to } = useMemo(() => {
    const range = getVisibleRecordDateRange({
      isMonthlyExpanded,
      selectedDate,
      viewMonth,
    });

    let nextFrom = range.from;
    const nextTo = range.to;

    // 첫 등원일 이전 구간은 조회·마커 모두 불필요
    if (firstAttendKey && nextFrom < firstAttendKey) {
      nextFrom = firstAttendKey;
    }

    return { from: nextFrom, to: nextTo };
  }, [firstAttendKey, isMonthlyExpanded, selectedDate, viewMonth]);

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
    enabled: shouldFetchMarks,
  });

  const markedDateKeys = useMemo(() => {
    if (!isVisibleRangeValid && markedDateKeysProp == null) {
      return new Set<string>();
    }
    if (markedDateKeysProp) {
      return filterMarksFromFirstAttend(markedDateKeysProp, firstAttendKey);
    }
    return filterMarksFromFirstAttend(recordDateSet, firstAttendKey);
  }, [firstAttendKey, isVisibleRangeValid, markedDateKeysProp, recordDateSet]);

  const handleSelectDate = (date: Date) => {
    let next = startOfDay(date);
    if (isBeforeDay(next, minDate)) next = minDate;
    if (isAfterDay(next, maxDate)) next = maxDate;
    onSelectDate(next);
    setViewMonth(startOfDay(new Date(next.getFullYear(), next.getMonth(), 1)));
  };

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
      onSelectDate={handleSelectDate}
      onExpandMonthly={handleExpandMonthly}
    />
  );
}

export { GuardianKindergartenDateCalendar };

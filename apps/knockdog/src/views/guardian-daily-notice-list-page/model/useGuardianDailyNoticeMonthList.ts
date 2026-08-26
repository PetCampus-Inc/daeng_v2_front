'use client';

import { useMemo } from 'react';

import {
  type GuardianCalendarDailyNotice,
  type GuardianSchoolRecordDay,
  useGuardianSchoolRecordsQuery,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { addDays, startOfDay } from '@shared/lib/calendar-date';

interface GuardianDailyNoticeMonthItem {
  /** YYYY-MM-DD */
  dateKey: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  dailyNotice: GuardianCalendarDailyNotice | null;
  thumbnailUrl: string | null;
}

type GuardianDailyNoticeTimelineRow =
  | {
      type: 'notice';
      id: string;
      dateKey: string;
      date: Date;
      item: GuardianDailyNoticeMonthItem;
    }
  | {
      type: 'disconnected';
      id: string;
      dateKey: string;
      date: Date;
    }
  | {
      type: 'connected';
      id: string;
      dateKey: string;
      date: Date;
    };

interface UseGuardianDailyNoticeMonthListParams {
  schoolId?: string | null;
  petId?: string | null;
  selectedMonth: Date;
  firstAttendedAt?: Date | null;
  /** 연결 이력 connectedAt. 연결 이력과 리스트 시작일을 맞춘다 */
  attendedFrom?: Date | null;
  /** 연결 해제일. 없으면 퍼블리싱 폴백 */
  attendedUntil?: Date | null;
  isDisconnected?: boolean;
  enabled?: boolean;
  /** 펫 목록 조회 완료 여부 — 미완료일 때만 로딩으로 취급 */
  isPetsReady?: boolean;
  /** 연결 이력 조회 로딩 상태 */
  isMembershipPending?: boolean;
}

function isSameYearMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return startOfDay(new Date(Number(year), Number(month) - 1, Number(day)));
}

function formatYearMonth(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toNoticeItem(day: GuardianSchoolRecordDay): GuardianDailyNoticeMonthItem {
  const date = parseDateKey(day.dateKey);
  return {
    dateKey: day.dateKey,
    date,
    checkInAt: day.checkInAt ?? null,
    checkOutAt: day.checkOutAt ?? null,
    dailyNotice: day.dailyNotice ?? null,
    thumbnailUrl: day.thumbnailUrl ?? null,
  };
}

/**
 * records days(최신→과거) + membership 이벤트를 날짜 타임라인으로 합침.
 * - 같은 날: 알림장→CONNECTED/DISCONNECTED
 * - CONNECTED 배너는 해당 월 가장 이른 연결만 표시되도록 함.
 * - DISCONNECTED는 전부 날짜 위치에 삽입되므로 리스트 상단 고정 금지.
 */
function buildTimelineRows(
  days: GuardianSchoolRecordDay[],
  options: {
    fallbackConnectedDate: Date | null;
    fallbackDisconnectedDate: Date | null;
  }
): GuardianDailyNoticeTimelineRow[] {
  const earliestConnectedDateKey = days.reduce<string | null>((earliest, day) => {
    if (!day.membershipEvents.includes('CONNECTED')) return earliest;
    if (!earliest || day.dateKey < earliest) return day.dateKey;
    return earliest;
  }, null);

  const rows: GuardianDailyNoticeTimelineRow[] = [];
  let hasConnectedRow = false;
  let hasDisconnectedRow = false;

  for (const day of days) {
    const date = parseDateKey(day.dateKey);
    const hasRecord = Boolean(day.checkInAt || day.checkOutAt || day.dailyNotice);

    if (hasRecord) {
      rows.push({
        type: 'notice',
        id: `notice-${day.dateKey}`,
        dateKey: day.dateKey,
        date,
        item: toNoticeItem(day),
      });
    }

    // API 이벤트는 시간순(오름차순) 가정 → 최신순 리스트에서는 역순
    const events = [...day.membershipEvents].reverse();
    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      if (event === 'DISCONNECTED') {
        rows.push({
          type: 'disconnected',
          id: `disconnected-${day.dateKey}-${index}`,
          dateKey: day.dateKey,
          date,
        });
        hasDisconnectedRow = true;
        continue;
      }
      if (event === 'CONNECTED' && day.dateKey === earliestConnectedDateKey) {
        rows.push({
          type: 'connected',
          id: `connected-${day.dateKey}-${index}`,
          dateKey: day.dateKey,
          date,
        });
        hasConnectedRow = true;
      }
    }
  }

  const { fallbackConnectedDate, fallbackDisconnectedDate } = options;

  if (!hasDisconnectedRow && fallbackDisconnectedDate) {
    const dateKey = formatDateKey(fallbackDisconnectedDate);
    const insertAt = rows.findIndex(
      (row) => row.dateKey < dateKey || (row.dateKey === dateKey && row.type !== 'notice')
    );
    const row: GuardianDailyNoticeTimelineRow = {
      type: 'disconnected',
      id: `disconnected-fallback-${dateKey}`,
      dateKey,
      date: startOfDay(fallbackDisconnectedDate),
    };
    if (insertAt < 0) rows.push(row);
    else rows.splice(insertAt, 0, row);
  }

  if (!hasConnectedRow && fallbackConnectedDate) {
    const dateKey = formatDateKey(fallbackConnectedDate);
    const insertAt = rows.findIndex((row) => row.dateKey < dateKey);
    const row: GuardianDailyNoticeTimelineRow = {
      type: 'connected',
      id: `connected-fallback-${dateKey}`,
      dateKey,
      date: startOfDay(fallbackConnectedDate),
    };
    if (insertAt < 0) rows.push(row);
    else rows.splice(insertAt, 0, row);
  }

  return rows;
}

/**
 * 선택 월의 등원일별 알림장 리스트.
 * `guardian/school/records` 월별 응답을 그대로 사용한다. (petId + schoolId 스코프)
 */
function useGuardianDailyNoticeMonthList({
  schoolId,
  petId,
  selectedMonth,
  firstAttendedAt = null,
  attendedFrom = null,
  attendedUntil = null,
  isDisconnected = false,
  enabled = true,
  isPetsReady = false,
  isMembershipPending = false,
}: UseGuardianDailyNoticeMonthListParams) {
  const userId = useUserStore((state) => state.user?.userId);
  const yearMonth = useMemo(() => formatYearMonth(selectedMonth), [selectedMonth]);
  const schoolRecordsQuery = useGuardianSchoolRecordsQuery({
    userId,
    petId,
    schoolId,
    yearMonth,
    enabled: enabled && Boolean(schoolId) && Boolean(petId),
  });
  const records = schoolRecordsQuery.data;
  const firstAvailableMonth = records?.firstAvailableMonth ?? null;
  const lastAvailableMonth = records?.lastAvailableMonth ?? null;

  /**
   * 월 네비 하한.
   * records의 `firstAvailableMonth`(이 유치원 최초 연결월)를 우선 — 재연결해도 과거 이력 월로 이동 가능
   */
  const effectiveFirstAttendedAt = useMemo(() => {
    if (firstAvailableMonth) return startOfDay(firstAvailableMonth);
    if (attendedFrom) return startOfDay(attendedFrom);
    if (schoolId) return null;
    if (firstAttendedAt) return startOfDay(firstAttendedAt);
    return null;
  }, [attendedFrom, firstAttendedAt, firstAvailableMonth, schoolId]);

  const isAuthPending = enabled && !userId;
  const isPetLookupPending = enabled && !isPetsReady;
  const isDisconnectRangePending =
    enabled && isDisconnected && !attendedUntil && lastAvailableMonth == null;
  const isRecordsPending = Boolean(schoolId) && schoolRecordsQuery.isPending;
  const isPending =
    isAuthPending ||
    isPetLookupPending ||
    isDisconnectRangePending ||
    isMembershipPending ||
    isRecordsPending;
  const hasError = Boolean(schoolId) && schoolRecordsQuery.isError;

  const items = useMemo(() => {
    const days = records?.days ?? [];
    return days.reduce<GuardianDailyNoticeMonthItem[]>((acc, day) => {
      const hasRecord = Boolean(day.checkInAt || day.checkOutAt || day.dailyNotice);
      if (!hasRecord) return acc;
      acc.push(toNoticeItem(day));
      return acc;
    }, []);
  }, [records?.days]);

  /** 폴백으로 만든 날짜인지 구분 — 월 이동 하한 계산에는 사용하지 않는다 */
  const isFirstAttendanceDateFallback = !schoolId && effectiveFirstAttendedAt == null;

  const fallbackConnectedDate = useMemo(() => {
    const days = records?.days ?? [];
    const hasConnectedEvent = days.some((day) => day.membershipEvents.includes('CONNECTED'));
    if (hasConnectedEvent) return null;

    if (schoolId) {
      if (
        firstAvailableMonth &&
        isSameYearMonth(firstAvailableMonth, selectedMonth) &&
        items.length > 0
      ) {
        const oldestAttendedDate = items[items.length - 1]?.date;
        return oldestAttendedDate ? startOfDay(oldestAttendedDate) : null;
      }
      return null;
    }

    if (attendedFrom && isSameYearMonth(attendedFrom, selectedMonth)) {
      return startOfDay(attendedFrom);
    }

    if (!effectiveFirstAttendedAt) {
      const oldestAttendedDate = items[items.length - 1]?.date;
      return oldestAttendedDate ? addDays(oldestAttendedDate, -1) : null;
    }

    return isSameYearMonth(effectiveFirstAttendedAt, selectedMonth)
      ? startOfDay(effectiveFirstAttendedAt)
      : null;
  }, [
    attendedFrom,
    effectiveFirstAttendedAt,
    firstAvailableMonth,
    items,
    records?.days,
    schoolId,
    selectedMonth,
  ]);

  const fallbackDisconnectedDate = useMemo(() => {
    const days = records?.days ?? [];
    const hasDisconnectedEvent = days.some((day) => day.membershipEvents.includes('DISCONNECTED'));
    if (hasDisconnectedEvent) return null;
    if (!isDisconnected) return null;

    const until =
      attendedUntil ??
      (lastAvailableMonth
        ? startOfDay(
            new Date(lastAvailableMonth.getFullYear(), lastAvailableMonth.getMonth() + 1, 0)
          )
        : null);

    if (!until) {
      const newestAttendedDate = items[0]?.date;
      return newestAttendedDate ? addDays(newestAttendedDate, 1) : null;
    }

    return isSameYearMonth(until, selectedMonth) ? startOfDay(until) : null;
  }, [attendedUntil, isDisconnected, items, lastAvailableMonth, records?.days, selectedMonth]);

  const timeline = useMemo(
    () =>
      buildTimelineRows(records?.days ?? [], {
        fallbackConnectedDate,
        fallbackDisconnectedDate,
      }),
    [fallbackConnectedDate, fallbackDisconnectedDate, records?.days]
  );

  return {
    items,
    timeline,
    firstAttendanceDate: timeline.find((row) => row.type === 'connected')?.date ?? null,
    attendedUntilDate: timeline.find((row) => row.type === 'disconnected')?.date ?? null,
    /** 월 네비 하한 — 첫 등원(또는 앨범 첫 이용 월) */
    effectiveFirstAttendedAt,
    lastAvailableMonth,
    isFirstAttendanceDateFallback,
    isPending,
    hasError,
  };
}

export { useGuardianDailyNoticeMonthList };
export type { GuardianDailyNoticeMonthItem, GuardianDailyNoticeTimelineRow };

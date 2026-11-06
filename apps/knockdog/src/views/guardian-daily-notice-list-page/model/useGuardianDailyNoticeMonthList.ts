'use client';

import { useMemo } from 'react';

import {
  type GuardianAlbumMembershipPeriod,
} from '@entities/guardian-album';
import {
  type GuardianSchoolRecordDay,
  useGuardianSchoolRecordsQuery,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { buildGuardianDailyNoticeMonthTimeline } from '@views/guardian-daily-notice-list-page/model/buildGuardianDailyNoticeMonthTimeline';
import type {
  GuardianDailyNoticeMonthItem,
  GuardianDailyNoticeTimelineRow,
} from '@views/guardian-daily-notice-list-page/model/guardianDailyNoticeTimelineTypes';
import { addDays, startOfDay } from '@shared/lib/calendar-date';

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
  /** connections API 사이클 — records membershipEvent보다 우선 */
  membershipPeriods?: GuardianAlbumMembershipPeriod[];
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
 * 해당 날짜에서 해제 배너가 알림장보다 위(최신)인지.
 * - DISCONNECTED만 있음 → 해제가 최신
 * - CONNECTED+DISCONNECTED 같은 날 → membership 종료일이면 해제가 최신, 아니면 재연결
 * - attendedUntil만 맞고 records에 이벤트 없음 → false (해제 배너는 이벤트 있는 날에만)
 */
function isDisconnectNewestForDay(
  day: GuardianSchoolRecordDay,
  membershipEndDateKey: string | null
): boolean {
  const hasDisconnected = day.membershipEvents.includes('DISCONNECTED');
  const hasConnected = day.membershipEvents.includes('CONNECTED');

  if (hasDisconnected && !hasConnected) return true;

  if (hasDisconnected && hasConnected) {
    return membershipEndDateKey === day.dateKey;
  }

  return false;
}

/**
 * records days(최신→과거) + membership 이벤트를 날짜 타임라인으로 합침.
 * - 리스트 위가 최신
 * - 같은 날 membership이 해제로 끝남: DISCONNECTED → 알림장 → CONNECTED
 * - 같은 날 해제 후 재연결(현재 재원): 알림장 → CONNECTED → DISCONNECTED
 * - records에 재연결 CONNECTED가 없으면 connections.attendedFrom으로 폴백
 */
function buildTimelineRows(
  days: GuardianSchoolRecordDay[],
  options: {
    fallbackConnectedDate: Date | null;
    fallbackDisconnectedDate: Date | null;
    /** 선택 membership 종료일 — 이 날짜는 해제가 최신 */
    membershipEndDateKey: string | null;
  }
): GuardianDailyNoticeTimelineRow[] {
  const rows: GuardianDailyNoticeTimelineRow[] = [];
  let hasDisconnectedRow = false;
  const connectedDateKeys = new Set<string>();
  const { fallbackConnectedDate, fallbackDisconnectedDate, membershipEndDateKey } = options;

  for (const day of days) {
    const date = parseDateKey(day.dateKey);
    const hasRecord = Boolean(day.checkInAt || day.checkOutAt || day.dailyNotice);
    const disconnectedEvents = day.membershipEvents.filter((event) => event === 'DISCONNECTED');
    const connectedEvents = day.membershipEvents.filter((event) => event === 'CONNECTED');
    const disconnectIsNewest = isDisconnectNewestForDay(day, membershipEndDateKey);

    const pushDisconnected = () => {
      for (let index = 0; index < disconnectedEvents.length; index += 1) {
        rows.push({
          type: 'disconnected',
          id: `disconnected-${day.dateKey}-${index}`,
          dateKey: day.dateKey,
          date,
        });
        hasDisconnectedRow = true;
      }
    };

    const pushConnected = () => {
      for (let index = 0; index < connectedEvents.length; index += 1) {
        rows.push({
          type: 'connected',
          id: `connected-${day.dateKey}-${index}`,
          dateKey: day.dateKey,
          date,
        });
        connectedDateKeys.add(day.dateKey);
      }
    };

    const pushNotice = () => {
      if (!hasRecord) return;
      rows.push({
        type: 'notice',
        id: `notice-${day.dateKey}`,
        dateKey: day.dateKey,
        date,
        item: toNoticeItem(day),
      });
    };

    if (disconnectIsNewest) {
      // 해제로 끝남: 해제(최신) → 알림장 → 연결시작
      pushDisconnected();
      pushNotice();
      pushConnected();
    } else {
      // 재연결이 더 최신: 알림장 → 재연결 → 이전 해제
      pushNotice();
      pushConnected();
      pushDisconnected();
    }
  }

  if (!hasDisconnectedRow && fallbackDisconnectedDate) {
    const dateKey = formatDateKey(fallbackDisconnectedDate);
    const disconnectIsNewest = membershipEndDateKey === dateKey;
    // 해제가 최신이면 날짜 블록 맨 위, 아니면 맨 아래
    const insertAt = disconnectIsNewest
      ? rows.findIndex((row) => row.dateKey < dateKey || row.dateKey === dateKey)
      : rows.findIndex((row) => row.dateKey < dateKey);
    const row: GuardianDailyNoticeTimelineRow = {
      type: 'disconnected',
      id: `disconnected-fallback-${dateKey}`,
      dateKey,
      date: startOfDay(fallbackDisconnectedDate),
    };
    if (insertAt < 0) rows.push(row);
    else rows.splice(insertAt, 0, row);
  }

  // 재연결일: records에 CONNECTED가 없어도 connections.connectedAt(attendedFrom)으로 배너 추가
  if (fallbackConnectedDate) {
    const dateKey = formatDateKey(fallbackConnectedDate);
    if (!connectedDateKeys.has(dateKey)) {
      const disconnectIsNewest = membershipEndDateKey === dateKey;
      // 해제로 끝난 날: 날짜 블록 끝(notice 다음). 재연결 날: DISCONNECTED 앞
      const insertAt = disconnectIsNewest
        ? rows.findIndex((row) => row.dateKey < dateKey)
        : rows.findIndex(
            (row) =>
              row.dateKey < dateKey ||
              (row.dateKey === dateKey && row.type === 'disconnected')
          );
      const row: GuardianDailyNoticeTimelineRow = {
        type: 'connected',
        id: `connected-fallback-${dateKey}`,
        dateKey,
        date: startOfDay(fallbackConnectedDate),
      };
      if (insertAt < 0) rows.push(row);
      else rows.splice(insertAt, 0, row);
    }
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
  membershipPeriods = [],
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

    // 최신 membership 시작일(재연결 포함). 해당 날짜에 CONNECTED 이벤트가 없으면 폴백
    if (attendedFrom && isSameYearMonth(attendedFrom, selectedMonth)) {
      const attendedFromKey = formatDateKey(attendedFrom);
      const hasConnectedOnAttendedFrom = days.some(
        (day) => day.dateKey === attendedFromKey && day.membershipEvents.includes('CONNECTED')
      );
      if (!hasConnectedOnAttendedFrom) return startOfDay(attendedFrom);
    }

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

  const membershipEndDateKey = useMemo(() => {
    if (!isDisconnected) return null;

    const days = records?.days ?? [];

    const disconnectOnlyDay = days.find(
      (day) =>
        day.membershipEvents.includes('DISCONNECTED') &&
        !day.membershipEvents.includes('CONNECTED')
    );
    if (disconnectOnlyDay) return disconnectOnlyDay.dateKey;

    const sameDayEndDay = days.find(
      (day) =>
        day.membershipEvents.includes('DISCONNECTED') &&
        day.membershipEvents.includes('CONNECTED')
    );
    if (sameDayEndDay) return sameDayEndDay.dateKey;

    if (attendedUntil) return formatDateKey(attendedUntil);
    if (fallbackDisconnectedDate) return formatDateKey(fallbackDisconnectedDate);
    return null;
  }, [attendedUntil, fallbackDisconnectedDate, isDisconnected, records?.days]);

  const isDisconnectedView = useMemo(
    () =>
      isDisconnected ||
      (membershipPeriods.length > 0 &&
        membershipPeriods.every((period) => period.disconnectedAt != null)),
    [isDisconnected, membershipPeriods]
  );

  const timeline = useMemo(() => {
    const days = records?.days ?? [];

    if (membershipPeriods.length > 0) {
      return buildGuardianDailyNoticeMonthTimeline(days, membershipPeriods, selectedMonth, {
        isDisconnectedView,
      });
    }

    return buildTimelineRows(days, {
      fallbackConnectedDate,
      fallbackDisconnectedDate,
      membershipEndDateKey,
    });
  }, [
    fallbackConnectedDate,
    fallbackDisconnectedDate,
    isDisconnectedView,
    membershipEndDateKey,
    membershipPeriods,
    records?.days,
    selectedMonth,
  ]);

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
export type { GuardianDailyNoticeMonthItem, GuardianDailyNoticeTimelineRow } from '@views/guardian-daily-notice-list-page/model/guardianDailyNoticeTimelineTypes';

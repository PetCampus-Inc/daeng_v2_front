'use client';

import { useMemo } from 'react';

import {
  type GuardianCalendarDailyNotice,
  useGuardianSchoolRecordsQuery,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { addDays, isAfterDay, isBeforeDay, startOfDay } from '@shared/lib/calendar-date';

interface GuardianDailyNoticeMonthItem {
  /** YYYY-MM-DD */
  dateKey: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  dailyNotice: GuardianCalendarDailyNotice | null;
  thumbnailUrl: string | null;
}

interface UseGuardianDailyNoticeMonthListParams {
  membershipId?: string | null;
  petId?: string | null;
  selectedMonth: Date;
  firstAttendedAt?: Date | null;
  /** membership connectedAt. 연결 이력과 리스트 시작일을 맞춘다 */
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

/**
 * 선택 월의 등원일별 알림장 리스트.
 * `guardian/school/records` 월별 응답을 그대로 사용한다.
 */
function useGuardianDailyNoticeMonthList({
  membershipId,
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
    membershipId,
    yearMonth,
    enabled: enabled && Boolean(membershipId) && Boolean(petId),
  });
  const records = schoolRecordsQuery.data;
  const firstAvailableMonth = records?.firstAvailableMonth ?? null;
  const lastAvailableMonth = records?.lastAvailableMonth ?? null;

  /**
   * 월 네비 하한.
   * membership `connectedAt`- 연결 이력과 시작일을 맞춤.
   * `firstAvailableMonth`는 연·월만 오므로 connectedAt이 없을 때만 씀.
   */
  const effectiveFirstAttendedAt = useMemo(() => {
    if (attendedFrom) return startOfDay(attendedFrom);
    if (firstAvailableMonth) return startOfDay(firstAvailableMonth);
    if (membershipId) return null;
    if (firstAttendedAt) return startOfDay(firstAttendedAt);
    return null;
  }, [attendedFrom, firstAttendedAt, firstAvailableMonth, membershipId]);

  const isAuthPending = enabled && !userId;
  const isPetLookupPending = enabled && !isPetsReady;
  const isDisconnectRangePending =
    enabled && isDisconnected && !attendedUntil && lastAvailableMonth == null;
  const isRecordsPending = Boolean(membershipId) && schoolRecordsQuery.isPending;
  const isPending =
    isAuthPending ||
    isPetLookupPending ||
    isDisconnectRangePending ||
    isMembershipPending ||
    isRecordsPending;
  const hasError = Boolean(membershipId) && schoolRecordsQuery.isError;

  const items = useMemo(() => {
    const days = records?.days ?? [];
    return days.reduce<GuardianDailyNoticeMonthItem[]>((acc, day) => {
      const hasRecord = Boolean(day.checkInAt || day.checkOutAt || day.dailyNotice || day.thumbnailUrl || day.membershipEvent);
      if (!hasRecord) return acc;
      const date = parseDateKey(day.dateKey);
      if (attendedFrom && isBeforeDay(date, attendedFrom)) return acc;
      if (attendedUntil && isAfterDay(date, attendedUntil)) return acc;
      acc.push({
        dateKey: day.dateKey,
        date,
        checkInAt: day.checkInAt ?? null,
        checkOutAt: day.checkOutAt ?? null,
        dailyNotice: day.dailyNotice ?? null,
        thumbnailUrl: day.thumbnailUrl ?? null,
      });
      return acc;
    }, []);
  }, [attendedFrom, attendedUntil, records?.days]);

  /**
   * 첫 등원 월이면 리스트 하단에 시작 문구 노출.
   * 연결 이력 `connectedAt` 우선 — `firstAvailableMonth`는 1일로 떨어질 수 있음.
   */
  const firstAttendanceDate = useMemo(() => {
    if (attendedFrom && isSameYearMonth(attendedFrom, selectedMonth)) {
      return startOfDay(attendedFrom);
    }

    if (membershipId) {
      const connectedDay = (records?.days ?? []).find(
        (day) => day.membershipEvent === 'CONNECTED'
      );
      if (connectedDay && isSameYearMonth(connectedDay.date, selectedMonth)) {
        return startOfDay(connectedDay.date);
      }

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
    membershipId,
    records?.days,
    selectedMonth,
  ]);

  /** 폴백으로 만든 날짜인지 구분 — 월 이동 하한 계산에는 사용하지 않는다 */
  const isFirstAttendanceDateFallback = !membershipId && effectiveFirstAttendedAt == null;

  /**
   * 연결 해제 월이면 리스트 상단에 종료 문구 노출.
   */
  const attendedUntilDate = useMemo(() => {
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
  }, [attendedUntil, isDisconnected, items, lastAvailableMonth, selectedMonth]);

  return {
    items,
    firstAttendanceDate,
    attendedUntilDate,
    /** 월 네비 하한 — 첫 등원(또는 앨범 첫 이용 월) */
    effectiveFirstAttendedAt,
    lastAvailableMonth,
    isFirstAttendanceDateFallback,
    isPending,
    hasError,
  };
}

export { useGuardianDailyNoticeMonthList };
export type { GuardianDailyNoticeMonthItem };

'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import {
  getGuardianCalendarDetail,
  guardianCalendarDetailQueryKey,
  toGuardianCalendarDetail,
  type GuardianCalendarDailyNotice,
  type GuardianCalendarDetail,
} from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { useGuardianAlbumMonth } from '@views/guardian-album-page/model/useGuardianAlbumMonth';
import { addDays, formatDateKey, isAfterDay, isBeforeDay, startOfDay } from '@shared/lib/calendar-date';

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
  schoolId?: string | null;
  petId?: string | null;
  selectedMonth: Date;
  firstAttendedAt?: Date | null;
  /** 연결 해제일. 없으면 퍼블리싱 폴백 */
  attendedUntil?: Date | null;
  isDisconnected?: boolean;
  enabled?: boolean;
}

function isSameYearMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function hasCheckIn(detail: GuardianCalendarDetail | undefined) {
  if (!detail) return false;
  if (detail.checkInAt) return true;
  const status = detail.checkinoutStatus;
  return status === 'CHECKED_IN' || status === 'CHECKED_OUT';
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-');
  return startOfDay(new Date(Number(year), Number(month) - 1, Number(day)));
}

/** 선택 월에서 조회할 날짜 — 첫 등원일 이후, 오늘까지. 최신순 */
function buildMonthDateKeys(month: Date, firstAttendedAt: Date | null, today: Date) {
  const monthStart = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = startOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const rangeStart =
    firstAttendedAt && isBeforeDay(monthStart, firstAttendedAt)
      ? startOfDay(firstAttendedAt)
      : monthStart;
  const rangeEnd = isAfterDay(monthEnd, today) ? startOfDay(today) : monthEnd;

  if (isAfterDay(rangeStart, rangeEnd)) return [];

  const dateKeys: string[] = [];
  for (let cursor = rangeEnd; !isBeforeDay(cursor, rangeStart); cursor = addDays(cursor, -1)) {
    dateKeys.push(formatDateKey(cursor));
  }
  return dateKeys;
}

/**
 * 선택 월의 등원일별 알림장 리스트.
 * 등하원·알림장은 `calendar/detail`(일자별), 썸네일은 월별 앨범 응답에서 가져온다.
 */
function useGuardianDailyNoticeMonthList({
  schoolId,
  petId,
  selectedMonth,
  firstAttendedAt = null,
  attendedUntil = null,
  isDisconnected = false,
  enabled = true,
}: UseGuardianDailyNoticeMonthListParams) {
  const userId = useUserStore((state) => state.user?.userId);

  const {
    days: albumDays,
    firstAvailableMonth,
    connectionStartedAt,
  } = useGuardianAlbumMonth({
    schoolId,
    petId,
    selectedMonth,
    enabled: enabled && Boolean(schoolId) && Boolean(petId),
  });

  /**
   * 월 네비/조회 하한.
   * home `firstAttendedAt` → 앨범 `firstAvailableMonth`/`connectionStartedAt` 순.
   */
  const effectiveFirstAttendedAt = useMemo(() => {
    if (firstAttendedAt) return startOfDay(firstAttendedAt);
    if (firstAvailableMonth) return startOfDay(firstAvailableMonth);
    if (connectionStartedAt) return parseDateKey(connectionStartedAt);
    return null;
  }, [connectionStartedAt, firstAttendedAt, firstAvailableMonth]);

  const rangeEndDate = useMemo(
    () => startOfDay(attendedUntil ?? new Date()),
    [attendedUntil]
  );

  const dateKeys = useMemo(
    () => buildMonthDateKeys(selectedMonth, effectiveFirstAttendedAt, rangeEndDate),
    [selectedMonth, effectiveFirstAttendedAt, rangeEndDate]
  );

  const canQuery = enabled && Boolean(userId) && Boolean(petId) && dateKeys.length > 0;

  const thumbnailByDateKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const day of albumDays) {
      const url = day.photos[0]?.url;
      if (url) map.set(day.dateKey, url);
    }
    return map;
  }, [albumDays]);

  const queries = useQueries({
    queries: dateKeys.map((date) => ({
      queryKey: guardianCalendarDetailQueryKey(userId, petId ?? undefined, date),
      queryFn: () => getGuardianCalendarDetail({ petId: petId!, date }),
      select: (response: Awaited<ReturnType<typeof getGuardianCalendarDetail>>) =>
        toGuardianCalendarDetail(response.data),
      enabled: canQuery,
      staleTime: 60_000,
    })),
  });

  const details = queries.map((query) => query.data);
  const isPending = canQuery && queries.some((query) => query.isPending);
  const hasError = canQuery && queries.some((query) => query.isError);
  /** 개별 쿼리가 순차적으로 도착해도 items가 갱신되도록 */
  const detailsRevision = queries.map((query) => query.dataUpdatedAt).join(',');

  const items = useMemo(() => {
    return dateKeys.reduce<GuardianDailyNoticeMonthItem[]>((acc, dateKey, index) => {
      const detail = details[index];
      if (!hasCheckIn(detail)) return acc;

      acc.push({
        dateKey,
        date: parseDateKey(dateKey),
        checkInAt: detail?.checkInAt ?? null,
        checkOutAt: detail?.checkOutAt ?? null,
        dailyNotice: detail?.dailyNotice ?? null,
        thumbnailUrl: thumbnailByDateKey.get(dateKey) ?? null,
      });
      return acc;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- details는 매 렌더 새 배열이라 detailsRevision으로 추적
    }, []);
  }, [dateKeys, detailsRevision, thumbnailByDateKey]);

  /**
   * 첫 등원 월이면 리스트 하단에 시작 문구 노출.
   * 유효 첫 등원일이 없으면 퍼블리싱용으로 이 달 최신 등원일 하루 전을 쓴다.
   */
  const firstAttendanceDate = useMemo(() => {
    if (!effectiveFirstAttendedAt) {
      const oldestAttendedDate = items[items.length - 1]?.date;
      return oldestAttendedDate ? addDays(oldestAttendedDate, -1) : null;
    }

    return isSameYearMonth(effectiveFirstAttendedAt, selectedMonth)
      ? startOfDay(effectiveFirstAttendedAt)
      : null;
  }, [effectiveFirstAttendedAt, items, selectedMonth]);

  /**
   * 연결 해제 월이면 리스트 상단에 종료 문구 노출.
   */
  const attendedUntilDate = useMemo(() => {
    if (!isDisconnected) return null;

    if (!attendedUntil) {
      const newestAttendedDate = items[0]?.date;
      return newestAttendedDate ? addDays(newestAttendedDate, 1) : null;
    }

    return isSameYearMonth(attendedUntil, selectedMonth)
      ? startOfDay(attendedUntil)
      : null;
  }, [attendedUntil, isDisconnected, items, selectedMonth]);

  return {
    items,
    firstAttendanceDate,
    attendedUntilDate,
    /** 월 네비 하한 — 첫 등원(또는 앨범 첫 이용 월) */
    effectiveFirstAttendedAt,
    isPending,
    hasError,
  };
}

export { useGuardianDailyNoticeMonthList };
export type { GuardianDailyNoticeMonthItem };

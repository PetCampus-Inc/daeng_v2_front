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
  /** 펫 목록 조회 완료 여부 — 미완료일 때만 로딩으로 취급 */
  isPetsReady?: boolean;
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
  isPetsReady = false,
}: UseGuardianDailyNoticeMonthListParams) {
  const userId = useUserStore((state) => state.user?.userId);

  const {
    days: albumDays,
    firstAvailableMonth,
    lastAvailableMonth,
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

  /**
   * 연결 해제이면 해제일(없으면 앨범 마지막 이용 월 말일)까지만 조회.
   * attendedUntil이 없으면 오늘까지 잡혀 해제 이후 월을 빈 화면으로 훑게 된다.
   */
  const rangeEndDate = useMemo(() => {
    if (attendedUntil) return startOfDay(attendedUntil);
    if (isDisconnected && lastAvailableMonth) {
      return startOfDay(
        new Date(lastAvailableMonth.getFullYear(), lastAvailableMonth.getMonth() + 1, 0)
      );
    }
    return startOfDay(new Date());
  }, [attendedUntil, isDisconnected, lastAvailableMonth]);

  const dateKeys = useMemo(() => {
    const month =
      isDisconnected && lastAvailableMonth
        ? startOfDay(
            new Date(
              Math.min(
                selectedMonth.getTime(),
                new Date(lastAvailableMonth.getFullYear(), lastAvailableMonth.getMonth(), 1).getTime()
              )
            )
          )
        : selectedMonth;
    return buildMonthDateKeys(month, effectiveFirstAttendedAt, rangeEndDate);
  }, [
    effectiveFirstAttendedAt,
    isDisconnected,
    lastAvailableMonth,
    rangeEndDate,
    selectedMonth,
  ]);

  const canQuery =
    enabled &&
    Boolean(userId) &&
    Boolean(petId) &&
    dateKeys.length > 0 &&
    (!isDisconnected || attendedUntil != null || lastAvailableMonth != null);

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
  /**
   * 인증·펫 목록 조회 전만 로딩.
   * 펫 조회가 끝난 뒤 petId가 없어도(미등록 등) 무한 로딩하지 않는다.
   */
  const isAuthPending = enabled && !userId;
  const isPetLookupPending = enabled && !isPetsReady;
  const isDisconnectRangePending =
    enabled && isDisconnected && !attendedUntil && lastAvailableMonth == null;
  const isPending =
    isAuthPending ||
    isPetLookupPending ||
    isDisconnectRangePending ||
    (canQuery && queries.some((query) => query.isPending));
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
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- details는 매 렌더 새 배열이라 detailsRevision으로 추적
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

  /** 폴백으로 만든 날짜인지 구분 — 월 이동 하한 계산에는 사용하지 않는다 */
  const isFirstAttendanceDateFallback = effectiveFirstAttendedAt == null;

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

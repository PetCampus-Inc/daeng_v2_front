import {
  addDays,
  formatDateKey,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  startOfDay,
} from '@shared/lib/calendar-date';

import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';

interface GuardianAlbumDayAlbum {
  /** YYYY-MM-DD */
  dateKey: string;
  isAttended: boolean;
  /** 해당일 사진 로드 실패 */
  hasLoadError?: boolean;
  /** 해당일 전체 사진 수 (+N 계산용) */
  photoCount: number;
  photos: GuardianAlbumPhoto[];
}

interface GuardianAlbumMonthMock {
  /** 연결(첫 등원) 시작일 — 해당 월 리스트 하단에 시작 문구 노출 */
  connectionStartedAt: string;
  days: GuardianAlbumDayAlbum[];
}

interface CreateGuardianAlbumMonthMockOptions {
  /**
   * true면 오늘을 카드 리스트에 포함 (미등원 시 Today 섹션 대신 카드로 노출).
   * 등원 시에는 Today 섹션 전용이므로 false.
   */
  includeTodayAsDayCard?: boolean;
}

function toDateKey(date: Date) {
  return formatDateKey(date);
}

function createDayPhotos(
  dateKey: string,
  count: number,
  profileImage: string,
  bookmarkedIndexes: number[] = []
): GuardianAlbumPhoto[] {
  const bookmarked = new Set(bookmarkedIndexes);
  return Array.from({ length: count }, (_, index) => ({
    id: `${dateKey}-${index + 1}`,
    url: profileImage,
    uploadedAt: `${dateKey}T${String(10 + index).padStart(2, '0')}:00:00.000Z`,
    isBookmarked: bookmarked.has(index),
  }));
}

/**
 * mock 연결 시작일.
 * - 오늘 하루 섹션 = 당일만 (등원 시)
 * - 카드 리스트 = 연결일 이후 ~ 어제(등원 시) / 오늘(미등원 시)
 * - 월 네비 min = 연결 시작 달 / max = 이번 달
 */
const MOCK_ALBUM_CONNECTION_STARTED_AT = (() => {
  const now = new Date();
  return toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
})();

const DAY_ATTENDANCE_PATTERN = [true, false, true, false] as const;

/**
 * 선택 월에서 카드로 보여줄 앨범일.
 * - 기본: 오늘 제외(연결일~어제)
 * - includeToday: 오늘 포함(미등원 시 카드 리스트용)
 */
function getAlbumDatesInMonth(
  month: Date,
  connectionStartedAt: Date,
  today: Date,
  includeToday: boolean
) {
  const monthStart = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = startOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const rangeStart = isBeforeDay(monthStart, connectionStartedAt)
    ? startOfDay(connectionStartedAt)
    : monthStart;
  const rangeEnd = isSameMonth(month, today)
    ? includeToday
      ? startOfDay(today)
      : addDays(startOfDay(today), -1)
    : monthEnd;

  if (isBeforeDay(rangeEnd, rangeStart)) return [];

  const dates: Date[] = [];
  for (let cursor = rangeEnd; !isBeforeDay(cursor, rangeStart); cursor = addDays(cursor, -1)) {
    dates.push(cursor);
    if (dates.length >= (includeToday ? 5 : 4)) break;
  }
  return dates;
}

/**
 * 선택된 월 기준으로 등원일 앨범 카드 mock 생성.
 */
function createGuardianAlbumMonthMock(
  month: Date,
  profileImage?: string | null,
  today: Date = new Date(),
  options: CreateGuardianAlbumMonthMockOptions = {}
): GuardianAlbumMonthMock {
  const { includeTodayAsDayCard = false } = options;
  const connectionStartedAt = parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT);
  const todayStart = startOfDay(today);

  if (!profileImage) {
    return { connectionStartedAt: MOCK_ALBUM_CONNECTION_STARTED_AT, days: [] };
  }

  const days = getAlbumDatesInMonth(
    month,
    connectionStartedAt,
    today,
    includeTodayAsDayCard
  ).map((date, index) => {
    const dateKey = toDateKey(date);
    const isToday = isSameDay(date, todayStart);
    const pastIndex = includeTodayAsDayCard ? index - 1 : index;
    return {
      dateKey,
      isAttended: isToday
        ? false
        : (DAY_ATTENDANCE_PATTERN[pastIndex % DAY_ATTENDANCE_PATTERN.length] ?? false),
      photoCount: 74,
      photos: createDayPhotos(dateKey, 4, profileImage, index === 1 ? [0] : []),
    };
  });

  return { connectionStartedAt: MOCK_ALBUM_CONNECTION_STARTED_AT, days };
}

function isSameYearMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function parseDateKey(dateKey: string) {
  const [yearPart, monthPart, dayPart] = dateKey.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  return startOfDay(new Date(year, month - 1, day));
}

function compareYearMonth(a: Date, b: Date) {
  return a.getFullYear() * 12 + a.getMonth() - (b.getFullYear() * 12 + b.getMonth());
}

export type { GuardianAlbumDayAlbum, GuardianAlbumMonthMock };
export {
  MOCK_ALBUM_CONNECTION_STARTED_AT,
  compareYearMonth,
  createGuardianAlbumMonthMock,
  isSameYearMonth,
  parseDateKey,
  toDateKey,
};

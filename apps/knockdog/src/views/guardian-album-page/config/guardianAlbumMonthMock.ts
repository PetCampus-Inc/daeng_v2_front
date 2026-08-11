import {
  addDays,
  formatDateKey,
  isBeforeDay,
  isSameMonth,
  startOfDay,
} from '@shared/lib/calendar-date';

import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';

interface GuardianAlbumDayAlbum {
  /** YYYY-MM-DD */
  dateKey: string;
  isAttended: boolean;
  /** 해당일 전체 사진 수 (+N 계산용) */
  photoCount: number;
  photos: GuardianAlbumPhoto[];
}

interface GuardianAlbumMonthMock {
  /** 연결(첫 등원) 시작일 — 해당 월 리스트 하단에 시작 문구 노출 */
  connectionStartedAt: string;
  days: GuardianAlbumDayAlbum[];
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
 * - 오늘 하루 섹션 = 당일만
 * - 카드 리스트 = 연결일 이후 ~ 어제까지
 * - 월 네비 min = 연결 시작 달 / max = 이번 달
 */
const MOCK_ALBUM_CONNECTION_STARTED_AT = (() => {
  const now = new Date();
  return toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
})();

const DAY_ATTENDANCE_PATTERN = [true, false, true, false] as const;

/**
 * 선택 월에서 카드로 보여줄 과거 등원일 (오늘 제외, 연결일 이상).
 * 최신순 최대 4일 mock.
 */
function getPastAlbumDatesInMonth(month: Date, connectionStartedAt: Date, today: Date) {
  const monthStart = startOfDay(new Date(month.getFullYear(), month.getMonth(), 1));
  const monthEnd = startOfDay(new Date(month.getFullYear(), month.getMonth() + 1, 0));
  const rangeStart = isBeforeDay(monthStart, connectionStartedAt)
    ? startOfDay(connectionStartedAt)
    : monthStart;
  const rangeEnd = isSameMonth(month, today) ? addDays(startOfDay(today), -1) : monthEnd;

  if (isBeforeDay(rangeEnd, rangeStart)) return [];

  const dates: Date[] = [];
  for (let cursor = rangeEnd; !isBeforeDay(cursor, rangeStart); cursor = addDays(cursor, -1)) {
    dates.push(cursor);
    if (dates.length >= 4) break;
  }
  return dates;
}

/**
 * 선택된 월 기준으로 등원일 앨범 카드 mock 생성.
 * 오늘 사진은 Today 섹션 전용 — 리스트에는 포함하지 않음.
 */
function createGuardianAlbumMonthMock(
  month: Date,
  profileImage?: string | null,
  today: Date = new Date()
): GuardianAlbumMonthMock {
  const connectionStartedAt = parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT);

  if (!profileImage) {
    return { connectionStartedAt: MOCK_ALBUM_CONNECTION_STARTED_AT, days: [] };
  }

  const days = getPastAlbumDatesInMonth(month, connectionStartedAt, today).map((date, index) => {
    const dateKey = toDateKey(date);
    return {
      dateKey,
      isAttended: DAY_ATTENDANCE_PATTERN[index % DAY_ATTENDANCE_PATTERN.length] ?? false,
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

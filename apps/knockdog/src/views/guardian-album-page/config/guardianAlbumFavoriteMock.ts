import {
  addDays,
  isBeforeDay,
  isSameDay,
  startOfDay,
} from '@shared/lib/calendar-date';

import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import {
  MOCK_ALBUM_CONNECTION_STARTED_AT,
  parseDateKey,
  toDateKey,
} from '@views/guardian-album-page/config/guardianAlbumMonthMock';

const FAVORITE_PAGE_SIZE = 7;
const FAVORITE_PREVIEW_LIMIT = 6;

interface GuardianAlbumFavoriteDay {
  dateKey: string;
  isAttended: boolean;
  /** 해당일 즐겨찾기 사진 전체 수 (+N 계산용) */
  photoCount: number;
  /** 미리보기(최대 6장) */
  photos: GuardianAlbumPhoto[];
}

interface GuardianAlbumFavoritePage {
  days: GuardianAlbumFavoriteDay[];
  /** 다음 페이지 커서(마지막 로드 dateKey). 없으면 null */
  nextCursor: string | null;
}

interface CreateGuardianAlbumFavoritePageOptions {
  /** exclusive — 이 날짜보다 과거만 로드. null이면 오늘부터 */
  cursor?: string | null;
  profileImage?: string | null;
  today?: Date;
  pageSize?: number;
}

function createFavoritePhotos(
  dateKey: string,
  previewCount: number,
  profileImage: string
): GuardianAlbumPhoto[] {
  return Array.from({ length: previewCount }, (_, index) => ({
    id: `fav-${dateKey}-${index + 1}`,
    url: profileImage,
    uploadedAt: `${dateKey}T${String(12 + index).padStart(2, '0')}:00:00.000Z`,
    isBookmarked: true,
  }));
}

/**
 * 연결 시작~오늘 사이 즐겨찾기 일자 mock (최신순).
 * 직전 달(사진 없는 월)은 제외. 일부 날은 6장 초과로 +N 노출.
 */
function buildAllFavoriteDays(
  profileImage: string,
  today: Date = new Date()
): GuardianAlbumFavoriteDay[] {
  const connectionStartedAt = parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT);
  const todayStart = startOfDay(today);
  const emptyMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const days: GuardianAlbumFavoriteDay[] = [];

  for (
    let cursor = todayStart;
    !isBeforeDay(cursor, connectionStartedAt);
    cursor = addDays(cursor, -1)
  ) {
    const isEmptyMonth =
      cursor.getFullYear() === emptyMonth.getFullYear() &&
      cursor.getMonth() === emptyMonth.getMonth();
    if (isEmptyMonth) continue;

    // 이틀 중 하루만 즐겨찾기 있는 날로 mock
    const dayOfMonth = cursor.getDate();
    if (dayOfMonth % 2 === 0) continue;

    const dateKey = toDateKey(cursor);
    const isToday = isSameDay(cursor, todayStart);
    const photoCount = dayOfMonth % 5 === 1 ? 14 : dayOfMonth % 3 === 0 ? 5 : 3;
    const previewCount = Math.min(photoCount, FAVORITE_PREVIEW_LIMIT);

    days.push({
      dateKey,
      isAttended: !isToday && dayOfMonth % 3 !== 0,
      photoCount,
      photos: createFavoritePhotos(dateKey, previewCount, profileImage),
    });
  }

  return days;
}

/**
 * 커서 기반 즐겨찾기 일자 페이지 (최신순, 기본 7일).
 */
function createGuardianAlbumFavoritePage({
  cursor = null,
  profileImage,
  today = new Date(),
  pageSize = FAVORITE_PAGE_SIZE,
}: CreateGuardianAlbumFavoritePageOptions): GuardianAlbumFavoritePage {
  if (!profileImage) {
    return { days: [], nextCursor: null };
  }

  const allDays = buildAllFavoriteDays(profileImage, today);
  const startIndex =
    cursor == null ? 0 : allDays.findIndex((day) => day.dateKey === cursor) + 1;

  if (startIndex < 0 || startIndex >= allDays.length) {
    return { days: [], nextCursor: null };
  }

  const days = allDays.slice(startIndex, startIndex + pageSize);
  const lastDay = days[days.length - 1];
  const endIndex = startIndex + days.length;
  const nextCursor = endIndex < allDays.length && lastDay ? lastDay.dateKey : null;

  return { days, nextCursor };
}

function hasGuardianAlbumFavoritePhotos(profileImage?: string | null, today: Date = new Date()) {
  if (!profileImage) return false;
  return buildAllFavoriteDays(profileImage, today).length > 0;
}

export type { GuardianAlbumFavoriteDay, GuardianAlbumFavoritePage };
export {
  FAVORITE_PAGE_SIZE,
  FAVORITE_PREVIEW_LIMIT,
  createGuardianAlbumFavoritePage,
  hasGuardianAlbumFavoritePhotos,
};

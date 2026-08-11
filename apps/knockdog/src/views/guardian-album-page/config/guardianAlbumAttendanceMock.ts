import {
  addDays,
  isBeforeDay,
  startOfDay,
} from '@shared/lib/calendar-date';

import type { GuardianAlbumPhoto } from '@views/guardian-album-page/config/guardianAlbumTodayMock';
import {
  MOCK_ALBUM_CONNECTION_STARTED_AT,
  parseDateKey,
  toDateKey,
} from '@views/guardian-album-page/config/guardianAlbumMonthMock';

const ATTENDANCE_PAGE_SIZE = 7;
const ATTENDANCE_PREVIEW_LIMIT = 6;

interface GuardianAlbumAttendanceDay {
  dateKey: string;
  /** 등원일 필터에서는 항상 true */
  isAttended: true;
  /** 해당일 사진 전체 수 (+N 계산용) */
  photoCount: number;
  /** 미리보기(최대 6장) */
  photos: GuardianAlbumPhoto[];
}

interface GuardianAlbumAttendancePage {
  days: GuardianAlbumAttendanceDay[];
  nextCursor: string | null;
}

interface CreateGuardianAlbumAttendancePageOptions {
  cursor?: string | null;
  profileImage?: string | null;
  today?: Date;
  pageSize?: number;
}

function createAttendancePhotos(
  dateKey: string,
  previewCount: number,
  profileImage: string
): GuardianAlbumPhoto[] {
  return Array.from({ length: previewCount }, (_, index) => ({
    id: `att-${dateKey}-${index + 1}`,
    url: profileImage,
    uploadedAt: `${dateKey}T${String(10 + index).padStart(2, '0')}:00:00.000Z`,
    isBookmarked: false,
  }));
}

/**
 * 연결 시작~오늘 등원일 mock (최신순).
 * 직전 달(사진 없는 월) 제외. 일부 날은 6장 초과로 +N 노출.
 */
function buildAllAttendanceDays(
  profileImage: string,
  today: Date = new Date()
): GuardianAlbumAttendanceDay[] {
  const connectionStartedAt = parseDateKey(MOCK_ALBUM_CONNECTION_STARTED_AT);
  const todayStart = startOfDay(today);
  const emptyMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const days: GuardianAlbumAttendanceDay[] = [];

  for (
    let cursor = todayStart;
    !isBeforeDay(cursor, connectionStartedAt);
    cursor = addDays(cursor, -1)
  ) {
    const isEmptyMonth =
      cursor.getFullYear() === emptyMonth.getFullYear() &&
      cursor.getMonth() === emptyMonth.getMonth();
    if (isEmptyMonth) continue;

    const dayOfMonth = cursor.getDate();
    // 주중 패턴에 가깝게 일부 날만 등원
    if (dayOfMonth % 3 === 0) continue;

    const dateKey = toDateKey(cursor);
    const photoCount = dayOfMonth % 4 === 1 ? 81 : 18;
    const previewCount = Math.min(photoCount, ATTENDANCE_PREVIEW_LIMIT);

    days.push({
      dateKey,
      isAttended: true,
      photoCount,
      photos: createAttendancePhotos(dateKey, previewCount, profileImage),
    });
  }

  return days;
}

function createGuardianAlbumAttendancePage({
  cursor = null,
  profileImage,
  today = new Date(),
  pageSize = ATTENDANCE_PAGE_SIZE,
}: CreateGuardianAlbumAttendancePageOptions): GuardianAlbumAttendancePage {
  if (!profileImage) {
    return { days: [], nextCursor: null };
  }

  const allDays = buildAllAttendanceDays(profileImage, today);
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

function hasGuardianAlbumAttendancePhotos(
  profileImage?: string | null,
  today: Date = new Date()
) {
  if (!profileImage) return false;
  return buildAllAttendanceDays(profileImage, today).length > 0;
}

export type { GuardianAlbumAttendanceDay, GuardianAlbumAttendancePage };
export {
  ATTENDANCE_PAGE_SIZE,
  ATTENDANCE_PREVIEW_LIMIT,
  createGuardianAlbumAttendancePage,
  hasGuardianAlbumAttendancePhotos,
};

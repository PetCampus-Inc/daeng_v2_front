/**
 * 보호자 오늘 앨범 API DTO
 * `GET /api/v0/albums/{schoolId}/today`
 */

import {
  toGuardianAlbumPhoto,
  type GuardianAlbumPhoto,
  type GuardianAlbumPhotoDto,
} from './guardianAlbumPhoto';

/** LocalDate — `"YYYY-MM-DD"` 또는 `[y, m, d]` */
type GuardianAlbumLocalDate = string | number[];

interface GuardianAlbumTodayDto {
  date?: GuardianAlbumLocalDate | null;
  attended?: boolean | null;
  totalCount?: number | null;
  photos?: GuardianAlbumPhotoDto[] | null;
}

interface GuardianAlbumToday {
  date: string | null;
  isAttendedToday: boolean;
  todayPhotoCount: number;
  photos: GuardianAlbumPhoto[];
}

function toDateKey(value: GuardianAlbumLocalDate | null | undefined): string | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return null;
  }

  if (!Array.isArray(value) || value.length < 3) return null;
  const [year, month, day] = value;
  if (
    typeof year !== 'number' ||
    typeof month !== 'number' ||
    typeof day !== 'number' ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toGuardianAlbumToday(dto: GuardianAlbumTodayDto | null | undefined): GuardianAlbumToday {
  const photos = (dto?.photos ?? [])
    .map(toGuardianAlbumPhoto)
    .filter((photo): photo is GuardianAlbumPhoto => photo != null);

  const totalCount =
    typeof dto?.totalCount === 'number' && Number.isFinite(dto.totalCount)
      ? Math.max(dto.totalCount, photos.length)
      : photos.length;

  return {
    date: toDateKey(dto?.date),
    isAttendedToday: Boolean(dto?.attended),
    todayPhotoCount: totalCount,
    photos,
  };
}

export { toGuardianAlbumToday };
export type {
  GuardianAlbumToday,
  GuardianAlbumTodayDto,
  GuardianAlbumPhoto as GuardianAlbumTodayPhoto,
  GuardianAlbumPhotoDto as GuardianAlbumTodayPhotoDto,
};

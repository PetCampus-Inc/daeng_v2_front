/**
 * 보호자 월별 앨범 API DTO
 * `GET /api/v0/albums/{schoolId}/months/{yearMonth}`
 */

import {
  toGuardianAlbumPhoto,
  type GuardianAlbumPhoto,
  type GuardianAlbumPhotoDto,
} from './guardianAlbumPhoto';

interface GuardianAlbumYearMonthDto {
  year?: number | null;
  month?: string | null;
  monthValue?: number | null;
  leapYear?: boolean | null;
}

/** LocalDate — `"YYYY-MM-DD"` 또는 `[y, m, d]` */
type GuardianAlbumLocalDate = string | number[];

interface GuardianAlbumMonthDayDto {
  date?: GuardianAlbumLocalDate | null;
  photoCount?: number | null;
  previewPhotos?: GuardianAlbumPhotoDto[] | null;
  attended?: boolean | null;
}

interface GuardianAlbumMonthDto {
  yearMonth?: GuardianAlbumYearMonthDto | null;
  firstAvailableMonth?: GuardianAlbumYearMonthDto | null;
  lastAvailableMonth?: GuardianAlbumYearMonthDto | null;
  days?: GuardianAlbumMonthDayDto[] | null;
}

interface GuardianAlbumMonthDay {
  /** YYYY-MM-DD */
  dateKey: string;
  isAttended: boolean;
  photoCount: number;
  photos: GuardianAlbumPhoto[];
}

interface GuardianAlbumMonth {
  yearMonth: Date | null;
  firstAvailableMonth: Date | null;
  lastAvailableMonth: Date | null;
  /** 연결(조회 가능) 시작 월의 1일 — 하단 시작 문구용 */
  connectionStartedAt: string | null;
  days: GuardianAlbumMonthDay[];
}

function toYearMonthDate(dto: GuardianAlbumYearMonthDto | null | undefined): Date | null {
  if (!dto) return null;

  const year = dto.year;
  const monthValue = dto.monthValue;
  if (
    typeof year === 'number' &&
    Number.isFinite(year) &&
    typeof monthValue === 'number' &&
    Number.isFinite(monthValue) &&
    monthValue >= 1 &&
    monthValue <= 12
  ) {
    return new Date(year, monthValue - 1, 1);
  }

  return null;
}

function toDateKeyFromYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
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

function toGuardianAlbumMonthDay(
  dto: GuardianAlbumMonthDayDto | null | undefined
): GuardianAlbumMonthDay | null {
  const dateKey = toDateKey(dto?.date);
  if (!dateKey) return null;

  const photos = (dto?.previewPhotos ?? [])
    .map(toGuardianAlbumPhoto)
    .filter((photo): photo is GuardianAlbumPhoto => photo != null);

  const photoCount =
    typeof dto?.photoCount === 'number' && Number.isFinite(dto.photoCount)
      ? Math.max(dto.photoCount, photos.length)
      : photos.length;

  return {
    dateKey,
    isAttended: Boolean(dto?.attended),
    photoCount,
    photos,
  };
}

function toGuardianAlbumMonth(dto: GuardianAlbumMonthDto | null | undefined): GuardianAlbumMonth {
  const firstAvailableMonth = toYearMonthDate(dto?.firstAvailableMonth);
  const lastAvailableMonth = toYearMonthDate(dto?.lastAvailableMonth);
  const yearMonth = toYearMonthDate(dto?.yearMonth);

  const days = (dto?.days ?? [])
    .map(toGuardianAlbumMonthDay)
    .filter((day): day is GuardianAlbumMonthDay => day != null)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));

  return {
    yearMonth,
    firstAvailableMonth,
    lastAvailableMonth,
    connectionStartedAt: firstAvailableMonth ? toDateKeyFromYearMonth(firstAvailableMonth) : null,
    days,
  };
}

/** `YYYY-MM` path param */
function formatGuardianAlbumYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export { formatGuardianAlbumYearMonth, toGuardianAlbumMonth };
export type {
  GuardianAlbumMonth,
  GuardianAlbumMonthDay,
  GuardianAlbumMonthDayDto,
  GuardianAlbumMonthDto,
  GuardianAlbumYearMonthDto,
};

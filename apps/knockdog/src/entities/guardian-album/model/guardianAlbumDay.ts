/**
 * 보호자 앨범 일별 카드 공통 DTO
 */

import {
  toGuardianAlbumPhoto,
  type GuardianAlbumPhoto,
  type GuardianAlbumPhotoDto,
} from './guardianAlbumPhoto';

/** LocalDate — `"YYYY-MM-DD"` 또는 `[y, m, d]` */
type GuardianAlbumLocalDate = string | number[];

interface GuardianAlbumDayDto {
  date?: GuardianAlbumLocalDate | null;
  photoCount?: number | null;
  previewPhotos?: GuardianAlbumPhotoDto[] | null;
  /** 일부 응답에서 previewPhotos 대신 photos 사용 */
  photos?: GuardianAlbumPhotoDto[] | null;
  attended?: boolean | null;
}

interface GuardianAlbumDay {
  /** YYYY-MM-DD */
  dateKey: string;
  isAttended: boolean;
  photoCount: number;
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

function pickDayPhotoDtos(dto: GuardianAlbumDayDto): GuardianAlbumPhotoDto[] {
  const previewPhotos = dto.previewPhotos ?? [];
  const photos = dto.photos ?? [];
  // 더 많이 내려준 쪽을 우선 (프리뷰 truncate 대응)
  return photos.length > previewPhotos.length ? photos : previewPhotos;
}

function toGuardianAlbumDay(dto: GuardianAlbumDayDto | null | undefined): GuardianAlbumDay | null {
  const dateKey = toDateKey(dto?.date);
  if (!dateKey || !dto) return null;

  const photos = pickDayPhotoDtos(dto)
    .map(toGuardianAlbumPhoto)
    .filter((photo): photo is GuardianAlbumPhoto => photo != null);

  const photoCount =
    typeof dto.photoCount === 'number' && Number.isFinite(dto.photoCount)
      ? Math.max(dto.photoCount, photos.length)
      : photos.length;

  return {
    dateKey,
    isAttended: Boolean(dto.attended),
    photoCount,
    photos,
  };
}

function sortGuardianAlbumDaysDesc(days: GuardianAlbumDay[]): GuardianAlbumDay[] {
  return [...days].sort((left, right) =>
    left.dateKey < right.dateKey ? 1 : left.dateKey > right.dateKey ? -1 : 0
  );
}

export { sortGuardianAlbumDaysDesc, toDateKey, toGuardianAlbumDay };
export type { GuardianAlbumDay, GuardianAlbumDayDto, GuardianAlbumLocalDate };

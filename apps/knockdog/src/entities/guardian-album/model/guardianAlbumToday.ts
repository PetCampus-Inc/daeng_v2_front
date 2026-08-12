/**
 * 보호자 오늘 앨범 API DTO
 * `GET /api/v0/albums/{schoolId}/today`
 */

type GuardianAlbumDateTime = string | number[];

interface GuardianAlbumTodayPhotoDto {
  id?: number | string | null;
  imageUrl?: string | null;
  authorId?: number | string | null;
  createdAt?: GuardianAlbumDateTime | null;
  isFavorite?: boolean | null;
}

interface GuardianAlbumTodayDto {
  date?: string | null;
  attended?: boolean | null;
  totalCount?: number | null;
  photos?: GuardianAlbumTodayPhotoDto[] | null;
}

interface GuardianAlbumTodayPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  isBookmarked: boolean;
}

interface GuardianAlbumToday {
  date: string | null;
  isAttendedToday: boolean;
  todayPhotoCount: number;
  photos: GuardianAlbumTodayPhoto[];
}

function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';
  return `${base}${url}`;
}

function parseCreatedAt(value: GuardianAlbumDateTime | null | undefined): string | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    if (value.length === 0) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (!Array.isArray(value) || value.length < 3) return null;

  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
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

  const millisecond =
    typeof nano === 'number' && Number.isFinite(nano) ? Math.floor(nano / 1_000_000) : 0;

  // LocalDateTime — KST wall → UTC (guardian-home과 동일)
  if (value.length === 3) {
    const date = new Date(Date.UTC(year, month - 1, day, -9));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (
    typeof hour !== 'number' ||
    typeof minute !== 'number' ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour - 9,
      minute,
      typeof second === 'number' ? second : 0,
      millisecond
    )
  );

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toGuardianAlbumTodayPhoto(
  dto: GuardianAlbumTodayPhotoDto | null | undefined
): GuardianAlbumTodayPhoto | null {
  if (!dto) return null;
  const id = dto.id;
  if (id == null || id === '') return null;

  const url = toAbsoluteImageUrl(dto.imageUrl);
  if (!url) return null;

  return {
    id: String(id),
    url,
    uploadedAt: parseCreatedAt(dto.createdAt) ?? new Date(0).toISOString(),
    isBookmarked: Boolean(dto.isFavorite),
  };
}

function toGuardianAlbumToday(dto: GuardianAlbumTodayDto | null | undefined): GuardianAlbumToday {
  const photos = (dto?.photos ?? [])
    .map(toGuardianAlbumTodayPhoto)
    .filter((photo): photo is GuardianAlbumTodayPhoto => photo != null);

  const totalCount =
    typeof dto?.totalCount === 'number' && Number.isFinite(dto.totalCount)
      ? Math.max(dto.totalCount, photos.length)
      : photos.length;

  return {
    date: dto?.date ?? null,
    isAttendedToday: Boolean(dto?.attended),
    todayPhotoCount: totalCount,
    photos,
  };
}

export { toGuardianAlbumToday };
export type {
  GuardianAlbumToday,
  GuardianAlbumTodayDto,
  GuardianAlbumTodayPhoto,
  GuardianAlbumTodayPhotoDto,
};

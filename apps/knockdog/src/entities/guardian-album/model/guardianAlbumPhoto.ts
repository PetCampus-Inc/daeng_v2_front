/**
 * 보호자 앨범 공통 사진 DTO / 매핑
 */

type GuardianAlbumDateTime = string | number[];

interface GuardianAlbumPhotoDto {
  id?: number | string | null;
  imageUrl?: string | null;
  authorId?: number | string | null;
  createdAt?: GuardianAlbumDateTime | null;
  isFavorite?: boolean | null;
}

interface GuardianAlbumPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  isBookmarked: boolean;
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

function toGuardianAlbumPhoto(
  dto: GuardianAlbumPhotoDto | null | undefined
): GuardianAlbumPhoto | null {
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

export { toGuardianAlbumPhoto };
export type { GuardianAlbumDateTime, GuardianAlbumPhoto, GuardianAlbumPhotoDto };

import type { AlbumPhotoDateTime, AlbumPhotoDto } from '../model/types';

interface MappedAlbumPhoto {
  id: string;
  key: string;
  url: string;
  uploadedAt: number;
}

/**
 * BE LocalDateTime(KST wall) / Instant ISO → epoch ms.
 * 배열·오프셋 없는 문자열은 KST로 해석 (보호자 앨범·guardian-home과 동일).
 */
function parseAlbumDateTime(value: AlbumPhotoDateTime | null | undefined): number | null {
  if (value == null) return null;

  if (typeof value === 'string') {
    if (value.length === 0) return null;

    // LocalDate `YYYY-MM-DD` — KST 자정
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      if (!year || !month || !day) return null;
      const date = new Date(Date.UTC(year, month - 1, day, -9));
      return Number.isNaN(date.getTime()) ? null : date.getTime();
    }

    // offset/Z 없으면 LocalDateTime(KST wall)로 취급
    const hasZone = /(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(value);
    if (!hasZone) {
      const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?/
      );
      if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const hour = Number(match[4]);
        const minute = Number(match[5]);
        const second = Number(match[6] ?? 0);
        const fraction = match[7] ?? '';
        const millisecond = fraction ? Number(fraction.padEnd(3, '0').slice(0, 3)) : 0;
        const date = new Date(
          Date.UTC(year, month - 1, day, hour - 9, minute, second, millisecond)
        );
        return Number.isNaN(date.getTime()) ? null : date.getTime();
      }
    }

    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : timestamp;
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

  // LocalDate `[y,m,d]` — KST 자정
  if (value.length === 3) {
    const date = new Date(Date.UTC(year, month - 1, day, -9));
    return Number.isNaN(date.getTime()) ? null : date.getTime();
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

  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function parseUploadedAt(photo: AlbumPhotoDto, fallback: number) {
  return parseAlbumDateTime(photo.createdAt) ?? parseAlbumDateTime(photo.uploadedAt) ?? fallback;
}

function mapAlbumPhotoDto(photo: AlbumPhotoDto, index = 0): MappedAlbumPhoto {
  const uploadedAt = parseUploadedAt(photo, Date.now() - index);

  return {
    id: String(photo.id),
    key: photo.key ?? photo.s3Key ?? String(photo.id),
    url: photo.url,
    uploadedAt,
  };
}

export { mapAlbumPhotoDto, parseAlbumDateTime };
export type { MappedAlbumPhoto };

import type { AlbumPhotoDto } from '../model/types';

interface MappedAlbumPhoto {
  id: string;
  key: string;
  url: string;
  uploadedAt: number;
}

function parseUploadedAt(photo: AlbumPhotoDto, fallback: number) {
  const raw = photo.createdAt ?? photo.uploadedAt;
  if (!raw) return fallback;

  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? fallback : timestamp;
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

export { mapAlbumPhotoDto };
export type { MappedAlbumPhoto };

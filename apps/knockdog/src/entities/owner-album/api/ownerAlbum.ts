import type {
  AlbumCommitRequest,
  AlbumCommitResponse,
  AlbumPhotoDto,
  AlbumUploadUrlItem,
  AlbumUploadUrlsRequest,
  AlbumUploadUrlsResponse,
} from '../model/types';

import { api, type ApiResponse } from '@shared/api';

function normalizeUploadUrlsData(data: unknown): AlbumUploadUrlsResponse {
  if (!data) {
    return { files: [] };
  }

  // data가 배열인 경우
  if (Array.isArray(data)) {
    return { files: normalizeUploadUrlItems(data) };
  }

  if (typeof data !== 'object') {
    return { files: [] };
  }

  const record = data as Record<string, unknown>;
  const rawFiles = record.files ?? record.items ?? record.uploadUrls ?? record.uploads;

  if (!Array.isArray(rawFiles)) {
    return { files: [] };
  }

  return { files: normalizeUploadUrlItems(rawFiles) };
}

function normalizeUploadUrlItems(rawFiles: unknown[]): AlbumUploadUrlItem[] {
  return rawFiles
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const tempKey =
        (typeof row.tempKey === 'string' && row.tempKey) ||
        (typeof row.key === 'string' && row.key) ||
        (typeof row.s3Key === 'string' && row.s3Key) ||
        null;
      const uploadUrl =
        (typeof row.uploadUrl === 'string' && row.uploadUrl) ||
        (typeof row.preSignedUrl === 'string' && row.preSignedUrl) ||
        (typeof row.putUrl === 'string' && row.putUrl) ||
        (typeof row.url === 'string' && row.url) ||
        null;

      if (!tempKey || !uploadUrl) return null;
      return { tempKey, uploadUrl };
    })
    .filter((item): item is AlbumUploadUrlItem => item != null);
}

function normalizeAlbumPhoto(item: unknown): AlbumPhotoDto | null {
  if (!item || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;

  const id = row.id;
  if (id == null) return null;

  const url =
    (typeof row.url === 'string' && row.url) ||
    (typeof row.photoUrl === 'string' && row.photoUrl) ||
    (typeof row.imageUrl === 'string' && row.imageUrl) ||
    (typeof row.preSignedUrl === 'string' && row.preSignedUrl) ||
    '';

  if (!url) return null;

  return {
    id: id as number | string,
    url,
    key: typeof row.key === 'string' ? row.key : undefined,
    s3Key: typeof row.s3Key === 'string' ? row.s3Key : undefined,
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : undefined,
    uploadedAt: typeof row.uploadedAt === 'string' ? row.uploadedAt : undefined,
  };
}

function normalizeCommitData(data: unknown): AlbumCommitResponse {
  if (!data || typeof data !== 'object') {
    return { uploaded: [], excludedCount: 0 };
  }

  const record = data as Record<string, unknown>;
  const rawUploaded = record.uploaded ?? record.photos ?? record.items;
  const uploaded = Array.isArray(rawUploaded)
    ? rawUploaded.map(normalizeAlbumPhoto).filter((item): item is AlbumPhotoDto => item != null)
    : [];

  return {
    uploaded,
    excludedCount: typeof record.excludedCount === 'number' ? record.excludedCount : 0,
    excludeReason: typeof record.excludeReason === 'string' ? record.excludeReason : null,
  };
}

/** `POST` - 업로드 Pre-Signed URL 배치 발급 */
async function postAlbumUploadUrls(schoolId: number, body: AlbumUploadUrlsRequest) {
  const response = await api
    .post(`albums/${schoolId}/photos/upload-urls`, { json: body })
    .json<ApiResponse<unknown>>();

  return {
    ...response,
    data: normalizeUploadUrlsData(response.data),
  } satisfies ApiResponse<AlbumUploadUrlsResponse>;
}

/** `POST` - S3 업로드 성공 tempKey를 앨범 사진으로 확정 */
async function postAlbumPhotosCommit(schoolId: number, body: AlbumCommitRequest) {
  const response = await api
    .post(`albums/${schoolId}/photos/commit`, { json: body })
    .json<ApiResponse<unknown>>();

  return {
    ...response,
    data: normalizeCommitData(response.data),
  } satisfies ApiResponse<AlbumCommitResponse>;
}

export { postAlbumUploadUrls, postAlbumPhotosCommit };

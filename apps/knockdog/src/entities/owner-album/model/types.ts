/** `POST albums/{schoolId}/photos/upload-urls` request file */
interface AlbumUploadFileRequest {
  filename: string;
  contentType: string;
  size: number;
}

interface AlbumUploadUrlsRequest {
  files: AlbumUploadFileRequest[];
}

/** upload-urls 응답 항목 — 요청 files 순서와 1:1 */
interface AlbumUploadUrlItem {
  tempKey: string;
  uploadUrl: string;
}

interface AlbumUploadUrlsResponse {
  files: AlbumUploadUrlItem[];
}

interface AlbumCommitItemRequest {
  tempKey: string;
  originalFilename: string;
}

interface AlbumCommitRequest {
  items: AlbumCommitItemRequest[];
}

/** 앨범 사진 DTO (목록·commit 공통) */
interface AlbumPhotoDto {
  id: number | string;
  url: string;
  key?: string;
  s3Key?: string;
  createdAt?: string;
  uploadedAt?: string;
}

interface AlbumCommitResponse {
  uploaded: AlbumPhotoDto[];
  excludedCount: number;
  excludeReason?: string | null;
}

/** `GET albums/{schoolId}/photos` */
interface AlbumPhotosListParams {
  schoolId: number;
  cursor?: number;
  size?: number;
}

interface AlbumPhotosListResponse {
  photos: AlbumPhotoDto[];
  nextCursor: number | null;
}

export type {
  AlbumUploadFileRequest,
  AlbumUploadUrlsRequest,
  AlbumUploadUrlItem,
  AlbumUploadUrlsResponse,
  AlbumCommitItemRequest,
  AlbumCommitRequest,
  AlbumPhotoDto,
  AlbumCommitResponse,
  AlbumPhotosListParams,
  AlbumPhotosListResponse,
};

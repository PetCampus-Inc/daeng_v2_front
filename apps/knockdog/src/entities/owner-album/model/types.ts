/** `POST albums/{schoolId}/photos/upload-urls`*/
interface AlbumUploadFileRequest {
  filename: string;
  contentType: string;
  size: number;
}

interface AlbumUploadUrlsRequest {
  files: AlbumUploadFileRequest[];
}

/** `POST albums/{schoolId}/photos/upload-urls` */
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

/** LocalDateTime — ISO 문자열 또는 `[y,m,d,h,mi,s,nano]` */
type AlbumPhotoDateTime = string | number[];

/** 앨범 사진 DTO (목록·commit 공통) */
interface AlbumPhotoDto {
  id: number | string;
  url: string;
  key?: string;
  s3Key?: string;
  createdAt?: AlbumPhotoDateTime;
  uploadedAt?: AlbumPhotoDateTime;
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
  AlbumPhotoDateTime,
  AlbumPhotoDto,
  AlbumCommitResponse,
  AlbumPhotosListParams,
  AlbumPhotosListResponse,
};

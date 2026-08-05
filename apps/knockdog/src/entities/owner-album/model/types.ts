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

/** commit 성공 사진 */
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

export type {
  AlbumUploadFileRequest,
  AlbumUploadUrlsRequest,
  AlbumUploadUrlItem,
  AlbumUploadUrlsResponse,
  AlbumCommitItemRequest,
  AlbumCommitRequest,
  AlbumPhotoDto,
  AlbumCommitResponse,
};

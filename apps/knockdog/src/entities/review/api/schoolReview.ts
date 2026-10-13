import { api, type ApiResponse } from '@shared/api';

import {
  SCHOOL_REVIEW_PAGE_SIZE,
  toSchoolReviewPage,
  type SchoolReviewListDto,
  type SchoolReviewPage,
  type SchoolReviewSort,
} from '../model/schoolReview';

interface GetSchoolReviewsParams {
  schoolId: number;
  sort: SchoolReviewSort;
  page: number;
  size?: number;
}

/** `GET /schools/{schoolId}/reviews` — 유치원 앱 리뷰 목록 */
function getSchoolReviews({ schoolId, sort, page, size = SCHOOL_REVIEW_PAGE_SIZE }: GetSchoolReviewsParams) {
  return api
    .get(`schools/${schoolId}/reviews`, {
      searchParams: { sort, page, size },
    })
    .json<ApiResponse<SchoolReviewListDto>>()
    .then((response) => toSchoolReviewPage(response.data, page));
}

interface SchoolReviewImageWrite {
  imageId?: number;
  tempKey?: string;
  originalFilename?: string;
}

interface CreateSchoolReviewParams {
  schoolId: number;
  rating: number;
  content: string;
  images: SchoolReviewImageWrite[];
}

/** `POST /schools/{schoolId}/reviews` — 앱 리뷰 작성. 새 사진은 tempKey, version은 생략 */
function createSchoolReview({ schoolId, rating, content, images }: CreateSchoolReviewParams) {
  return api
    .post(`schools/${schoolId}/reviews`, {
      json: {
        rating,
        content,
        images,
      },
    })
    .json<ApiResponse<unknown>>();
}

interface UpdateSchoolReviewParams {
  schoolId: number;
  reviewId: number;
  rating: number;
  content: string;
  images: SchoolReviewImageWrite[];
  version: number;
}

/** `PUT /schools/{schoolId}/reviews/{reviewId}` — 내 앱 리뷰 수정. version은 조회한 값 */
function updateSchoolReview({ schoolId, reviewId, rating, content, images, version }: UpdateSchoolReviewParams) {
  return api
    .put(`schools/${schoolId}/reviews/${reviewId}`, {
      json: { rating, content, images, version },
    })
    .json<ApiResponse<unknown>>();
}

interface DeleteSchoolReviewParams {
  schoolId: number;
  reviewId: number;
}

/** `DELETE /schools/{schoolId}/reviews/{reviewId}` — 내 앱 리뷰 삭제 */
function deleteSchoolReview({ schoolId, reviewId }: DeleteSchoolReviewParams) {
  return api.delete(`schools/${schoolId}/reviews/${reviewId}`).json<ApiResponse<unknown>>();
}

interface SchoolReviewImageUploadFile {
  filename: string;
  contentType: string;
  size: number;
}

interface SchoolReviewImageUploadTarget {
  key: string;
  uploadUrl: string;
}

function readUploadRows(data: unknown) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;
  const rows = record.items ?? record.files;
  return Array.isArray(rows) ? rows : [];
}

function toSchoolReviewImageUploadTargets(data: unknown): SchoolReviewImageUploadTarget[] {
  return readUploadRows(data).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const row = item as Record<string, unknown>;
    const key =
      (typeof row.tempKey === 'string' && row.tempKey) ||
      (typeof row.key === 'string' && row.key) ||
      (typeof row.s3Key === 'string' && row.s3Key) ||
      '';
    const uploadUrl =
      (typeof row.uploadUrl === 'string' && row.uploadUrl) ||
      (typeof row.preSignedUrl === 'string' && row.preSignedUrl) ||
      '';

    return key && uploadUrl ? [{ key, uploadUrl }] : [];
  });
}

/** `POST /schools/{schoolId}/reviews/image-upload-urls` — 리뷰 사진 임시 S3 업로드 URL. 최대 10장 */
function postSchoolReviewImageUploadUrls(schoolId: number, files: SchoolReviewImageUploadFile[]) {
  return api
    .post(`schools/${schoolId}/reviews/image-upload-urls`, {
      json: { files },
    })
    .json<ApiResponse<unknown>>()
    .then((response) => ({
      ...response,
      data: toSchoolReviewImageUploadTargets(response.data),
    }));
}

export {
  createSchoolReview,
  deleteSchoolReview,
  getSchoolReviews,
  postSchoolReviewImageUploadUrls,
  updateSchoolReview,
};
export type {
  CreateSchoolReviewParams,
  DeleteSchoolReviewParams,
  GetSchoolReviewsParams,
  SchoolReviewImageWrite,
  SchoolReviewImageUploadFile,
  SchoolReviewImageUploadTarget,
  SchoolReviewPage,
  UpdateSchoolReviewParams,
};

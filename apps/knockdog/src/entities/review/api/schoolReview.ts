import { ApiError, api, type ApiResponse } from '@shared/api';

import {
  SCHOOL_REVIEW_PAGE_SIZE,
  toSchoolReview,
  toSchoolReviewPage,
  type SchoolReviewItemDto,
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

interface GetSchoolReviewParams {
  schoolId: number;
  reviewId: number;
}

/** `GET /schools/{schoolId}/reviews/{reviewId}` — 앱 리뷰 상세. 없으면 null */
async function getSchoolReview({ schoolId, reviewId }: GetSchoolReviewParams) {
  try {
    const response = await api
      .get(`schools/${schoolId}/reviews/${reviewId}`)
      .json<ApiResponse<SchoolReviewItemDto | null>>();

    return response.data ? toSchoolReview(response.data) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
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

interface SchoolReviewWriteFields {
  rating: number;
  content: string;
  images: SchoolReviewImageWrite[];
}

interface CreateSchoolReviewParams extends SchoolReviewWriteFields {
  schoolId: number;
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

interface UpdateSchoolReviewParams extends SchoolReviewWriteFields {
  schoolId: number;
  reviewId: number;
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

interface SetSchoolReviewHelpfulParams {
  schoolId: number;
  reviewId: number;
  enabled: boolean;
}

interface SchoolReviewHelpful {
  helpfulCount?: number | null;
  helpedByMe?: boolean | null;
}

/** `PUT /schools/{schoolId}/reviews/{reviewId}/helpful?enabled=` — 도움돼요 적용/취소. 본인 리뷰는 불가 */
function setSchoolReviewHelpful({ schoolId, reviewId, enabled }: SetSchoolReviewHelpfulParams) {
  return api
    .put(`schools/${schoolId}/reviews/${reviewId}/helpful`, {
      searchParams: { enabled },
    })
    .json<ApiResponse<SchoolReviewHelpful>>();
}

interface SchoolReviewImageUploadFile {
  filename: string;
  contentType: string;
  size: number;
}

interface SchoolReviewImageUploadUrlResponse {
  items?: { tempKey?: string | null; uploadUrl?: string | null }[] | null;
}

/** `POST /schools/{schoolId}/reviews/image-upload-urls` — 리뷰 사진 임시 S3 업로드 URL. 최대 10장 */
function postSchoolReviewImageUploadUrls(schoolId: number, files: SchoolReviewImageUploadFile[]) {
  return api
    .post(`schools/${schoolId}/reviews/image-upload-urls`, {
      json: { files },
    })
    .json<ApiResponse<SchoolReviewImageUploadUrlResponse>>();
}

export {
  createSchoolReview,
  deleteSchoolReview,
  getSchoolReview,
  getSchoolReviews,
  postSchoolReviewImageUploadUrls,
  setSchoolReviewHelpful,
  updateSchoolReview,
};
export type {
  CreateSchoolReviewParams,
  DeleteSchoolReviewParams,
  SchoolReviewImageWrite,
  SetSchoolReviewHelpfulParams,
  UpdateSchoolReviewParams,
};

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

interface CreateSchoolReviewParams {
  schoolId: number;
  rating: number;
  content: string;
  images: string[];
}

/** `POST /schools/{schoolId}/reviews` — 앱 리뷰 작성. 사진은 S3 키, 없으면 빈 배열 */
function createSchoolReview({ schoolId, rating, content, images }: CreateSchoolReviewParams) {
  return api
    .post(`schools/${schoolId}/reviews`, {
      json: {
        rating,
        content,
        images,
        version: 0,
      },
    })
    .json<ApiResponse<unknown>>();
}

interface UpdateSchoolReviewParams {
  schoolId: number;
  reviewId: number;
  rating: number;
  content: string;
  images: string[];
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

export { createSchoolReview, deleteSchoolReview, getSchoolReviews, updateSchoolReview };
export type {
  CreateSchoolReviewParams,
  DeleteSchoolReviewParams,
  GetSchoolReviewsParams,
  SchoolReviewPage,
  UpdateSchoolReviewParams,
};

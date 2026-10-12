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

export { getSchoolReviews };
export type { GetSchoolReviewsParams, SchoolReviewPage };

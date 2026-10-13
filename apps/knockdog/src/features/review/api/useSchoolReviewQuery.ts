import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  createSchoolReviewDetailQueryOptions,
  createSchoolReviewInfiniteQueryOptions,
  parseSchoolId,
  type SchoolReview,
  type SchoolReviewSort,
} from '@entities/review';

import type { KnockdogReview, KnockdogReviewSort } from '../config/knockdogReviewMock';

const SCHOOL_REVIEW_SORT = {
  latest: 'LATEST',
  ratingDesc: 'RATING_HIGH',
  ratingAsc: 'RATING_LOW',
  helpful: 'HELPFUL',
} as const satisfies Record<KnockdogReviewSort, SchoolReviewSort>;

function toKnockdogReview(review: SchoolReview): KnockdogReview {
  return {
    id: review.id,
    score: review.rating,
    createdAt: review.createdAt,
    enrollment: review.isCurrentlyAttending ? 'attending' : 'former',
    content: review.content,
    images: review.photos.flatMap((photo) => (photo.url ? [photo.url] : [])),
    helpfulCount: review.helpfulCount,
    isHelpful: review.helpedByMe,
    isMine: review.mine,
    reportedByMe: review.reportedByMe,
  };
}

function useSchoolReviewQuery(
  schoolId: string | number | null | undefined,
  sort: KnockdogReviewSort,
  enabled = true
) {
  const parsedSchoolId = parseSchoolId(schoolId);
  const apiSort = SCHOOL_REVIEW_SORT[sort];

  return useInfiniteQuery({
    ...createSchoolReviewInfiniteQueryOptions(parsedSchoolId ?? 0, apiSort),
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map(toKnockdogReview),
      })),
    }),
    enabled: enabled && parsedSchoolId != null,
  });
}

function useSchoolReviewDetailQuery(schoolId: number | null, reviewId?: string) {
  const parsedReviewId = parseSchoolId(reviewId);

  return useQuery({
    ...createSchoolReviewDetailQueryOptions(schoolId ?? 0, parsedReviewId ?? 0),
    enabled: schoolId != null && parsedReviewId != null,
  });
}

export { useSchoolReviewDetailQuery, useSchoolReviewQuery };

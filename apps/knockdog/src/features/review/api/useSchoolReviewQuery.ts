import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  createMySchoolReviewInfiniteQueryOptions,
  createReviewableSchoolsQueryOptions,
  createSchoolReviewDetailQueryOptions,
  createSchoolReviewInfiniteQueryOptions,
  createSchoolReviewSummaryQueryOptions,
  parseSchoolId,
  type MySchoolReview,
  type SchoolReview,
  type SchoolReviewSort,
} from '@entities/review';

import type { KnockdogReview, KnockdogReviewSort } from '../config/knockdogReviewMock';
import type { MyWrittenReview, MyWrittenReviewSort } from '../config/myWrittenReview';

const SCHOOL_REVIEW_SORT = {
  latest: 'LATEST',
  ratingDesc: 'RATING_HIGH',
  ratingAsc: 'RATING_LOW',
  helpful: 'HELPFUL',
} as const satisfies Record<KnockdogReviewSort, SchoolReviewSort>;

const MY_REVIEW_SORT = {
  latest: 'LATEST',
  ratingDesc: 'RATING_HIGH',
  ratingAsc: 'RATING_LOW',
} as const satisfies Record<MyWrittenReviewSort, SchoolReviewSort>;

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

function toMyWrittenReview(review: MySchoolReview): MyWrittenReview {
  return {
    id: review.id,
    placeId: '',
    schoolId: review.schoolId,
    kindergartenName: review.schoolName,
    kindergartenImage: review.schoolThumbnailUrl,
    score: review.rating,
    createdAt: review.createdAt,
    content: review.content,
    images: review.photos.flatMap((photo) => (photo.url ? [photo.url] : [])),
  };
}

function useMySchoolReviewQuery(sort: MyWrittenReviewSort, enabled = true) {
  return useInfiniteQuery({
    ...createMySchoolReviewInfiniteQueryOptions(MY_REVIEW_SORT[sort]),
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map(toMyWrittenReview),
      })),
    }),
    enabled,
  });
}

function useReviewableSchoolsQuery(enabled = true) {
  return useQuery({
    ...createReviewableSchoolsQueryOptions(),
    enabled,
  });
}

function useSchoolReviewSummaryQuery(schoolId: string | number | null | undefined, enabled = true) {
  const parsedSchoolId = parseSchoolId(schoolId);

  return useQuery({
    ...createSchoolReviewSummaryQueryOptions(parsedSchoolId ?? 0),
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

export {
  useMySchoolReviewQuery,
  useReviewableSchoolsQuery,
  useSchoolReviewDetailQuery,
  useSchoolReviewQuery,
  useSchoolReviewSummaryQuery,
};

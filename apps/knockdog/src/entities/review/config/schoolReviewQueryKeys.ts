import { getMyReviews, getReviewableSchools, getSchoolReview, getSchoolReviewSummary, getSchoolReviews } from '../api/schoolReview';
import type { MySchoolReviewPage, SchoolReviewPage, SchoolReviewSort } from '../model/schoolReview';

const schoolReviewQueryKeys = {
  all: ['schoolReview'] as const,
  detail: (schoolId: number, reviewId: number) =>
    [...schoolReviewQueryKeys.all, schoolId, 'detail', reviewId] as const,
  infinite: (schoolId: number, sort: SchoolReviewSort) =>
    [...schoolReviewQueryKeys.all, schoolId, sort, 'infinite'] as const,
  summary: (schoolId: number) => [...schoolReviewQueryKeys.all, schoolId, 'summary'] as const,
} as const;

function createSchoolReviewDetailQueryOptions(schoolId: number, reviewId: number) {
  return {
    queryKey: schoolReviewQueryKeys.detail(schoolId, reviewId),
    queryFn: () => getSchoolReview({ schoolId, reviewId }),
  };
}

const mySchoolReviewQueryKeys = {
  all: ['mySchoolReview'] as const,
  infinite: (sort: SchoolReviewSort) => [...mySchoolReviewQueryKeys.all, sort, 'infinite'] as const,
  reviewable: () => [...mySchoolReviewQueryKeys.all, 'reviewable'] as const,
} as const;

function createReviewableSchoolsQueryOptions() {
  return {
    queryKey: mySchoolReviewQueryKeys.reviewable(),
    queryFn: getReviewableSchools,
  };
}

function createMySchoolReviewInfiniteQueryOptions(sort: SchoolReviewSort) {
  return {
    queryKey: mySchoolReviewQueryKeys.infinite(sort),
    queryFn: ({ pageParam }: { pageParam: number }) => getMyReviews({ sort, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: MySchoolReviewPage, _pages: MySchoolReviewPage[], lastPageParam: number) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  };
}

function createSchoolReviewSummaryQueryOptions(schoolId: number) {
  return {
    queryKey: schoolReviewQueryKeys.summary(schoolId),
    queryFn: () => getSchoolReviewSummary(schoolId),
  };
}

function createSchoolReviewInfiniteQueryOptions(schoolId: number, sort: SchoolReviewSort) {
  return {
    queryKey: schoolReviewQueryKeys.infinite(schoolId, sort),
    queryFn: ({ pageParam }: { pageParam: number }) => getSchoolReviews({ schoolId, sort, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: SchoolReviewPage, _pages: SchoolReviewPage[], lastPageParam: number) =>
      lastPage.hasNext ? lastPageParam + 1 : undefined,
  };
}

export {
  createMySchoolReviewInfiniteQueryOptions,
  createReviewableSchoolsQueryOptions,
  createSchoolReviewDetailQueryOptions,
  createSchoolReviewInfiniteQueryOptions,
  createSchoolReviewSummaryQueryOptions,
  mySchoolReviewQueryKeys,
  schoolReviewQueryKeys,
};

import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import {
  createSchoolReview,
  deleteSchoolReview,
  schoolReviewQueryKeys,
  updateSchoolReview,
  type CreateSchoolReviewParams,
  type DeleteSchoolReviewParams,
  type SchoolReviewPage,
  type UpdateSchoolReviewParams,
} from '@entities/review';

import { useSchoolReviewQuery } from './useSchoolReviewQuery';

interface SchoolReviewInfiniteData {
  pages: SchoolReviewPage[];
}

function findCachedSchoolReview(queryClient: QueryClient, schoolId: number, reviewId: string) {
  const entries = queryClient.getQueriesData<SchoolReviewInfiniteData>({
    queryKey: [...schoolReviewQueryKeys.all, schoolId],
  });

  for (const [, data] of entries) {
    const review = data?.pages.flatMap((page) => page.items).find((item) => item.id === reviewId);
    if (review) return review;
  }

  return undefined;
}

function useCachedSchoolReview(schoolId: number | null, reviewId?: string) {
  const queryClient = useQueryClient();
  const list = useSchoolReviewQuery(schoolId, 'latest', schoolId != null && Boolean(reviewId));
  const review =
    schoolId == null || !reviewId ? undefined : findCachedSchoolReview(queryClient, schoolId, reviewId);

  return {
    review,
    isLoading: Boolean(reviewId) && schoolId != null && !review && (list.isLoading || list.isFetching),
  };
}

function invalidateSchoolReviews(queryClient: QueryClient, schoolId: number) {
  return queryClient.invalidateQueries({ queryKey: [...schoolReviewQueryKeys.all, schoolId] });
}

function useSchoolReviewMutation<Params extends { schoolId: number }>(mutationFn: (params: Params) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (_data, variables) => invalidateSchoolReviews(queryClient, variables.schoolId),
  });
}

function useCreateSchoolReview() {
  return useSchoolReviewMutation<CreateSchoolReviewParams>(createSchoolReview);
}

function useUpdateSchoolReview() {
  return useSchoolReviewMutation<UpdateSchoolReviewParams>(updateSchoolReview);
}

function useDeleteSchoolReview() {
  return useSchoolReviewMutation<DeleteSchoolReviewParams>(deleteSchoolReview);
}

export { useCachedSchoolReview, useCreateSchoolReview, useDeleteSchoolReview, useUpdateSchoolReview };

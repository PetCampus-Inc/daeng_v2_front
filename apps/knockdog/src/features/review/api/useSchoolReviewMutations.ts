import { useMutation, useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query';
import {
  createSchoolReview,
  deleteSchoolReview,
  reportSchoolReview,
  schoolReviewQueryKeys,
  setSchoolReviewHelpful,
  updateSchoolReview,
  type CreateSchoolReviewParams,
  type DeleteSchoolReviewParams,
  type ReportSchoolReviewParams,
  type SchoolReviewPage,
  type SetSchoolReviewHelpfulParams,
  type UpdateSchoolReviewParams,
} from '@entities/review';

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

function useReportSchoolReview() {
  return useSchoolReviewMutation<ReportSchoolReviewParams>(reportSchoolReview);
}

function patchSchoolReviewHelpful(
  queryClient: QueryClient,
  schoolId: number,
  reviewId: number,
  helpfulCount: number,
  helpedByMe: boolean
) {
  const reviewKey = String(reviewId);

  queryClient.setQueriesData<InfiniteData<SchoolReviewPage>>(
    { queryKey: [...schoolReviewQueryKeys.all, schoolId] },
    (current) => {
      if (!current) return current;

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === reviewKey ? { ...item, helpfulCount, helpedByMe } : item
          ),
        })),
      };
    }
  );
}

function useSetSchoolReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SetSchoolReviewHelpfulParams) => setSchoolReviewHelpful(params),
    onSuccess: (response, variables) => {
      const helpfulCount = response.data?.helpfulCount;
      const helpedByMe = response.data?.helpedByMe;
      if (typeof helpfulCount !== 'number' || typeof helpedByMe !== 'boolean') {
        void invalidateSchoolReviews(queryClient, variables.schoolId);
        return;
      }

      patchSchoolReviewHelpful(queryClient, variables.schoolId, variables.reviewId, helpfulCount, helpedByMe);
    },
  });
}

export {
  useCreateSchoolReview,
  useDeleteSchoolReview,
  useReportSchoolReview,
  useSetSchoolReviewHelpful,
  useUpdateSchoolReview,
};

import { getReviewList } from '../api/review';

const reviewQueryKeys = {
  all: ['review'] as const,
  byTargetId: (targetId: string) => [...reviewQueryKeys.all, targetId] as const,
  infinite: (targetId: string) => [...reviewQueryKeys.byTargetId(targetId), 'infinite'] as const,
} as const;

const createReviewQueryOptions = (targetId: string) => ({
  queryKey: reviewQueryKeys.byTargetId(targetId),
  queryFn: () => getReviewList({ targetId, page: 1 }),
});

function createReviewInfiniteQueryOptions(targetId: string) {
  return {
    queryKey: reviewQueryKeys.infinite(targetId),
    queryFn: ({ pageParam = 1 }) => getReviewList({ targetId, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { paging: { hasNext: boolean; currentPage: number } }) => {
      return lastPage.paging.hasNext ? lastPage.paging.currentPage + 1 : undefined;
    },
  };
}

export { reviewQueryKeys, createReviewQueryOptions, createReviewInfiniteQueryOptions };

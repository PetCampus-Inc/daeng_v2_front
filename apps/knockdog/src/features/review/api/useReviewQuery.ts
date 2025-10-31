import { useInfiniteQuery } from '@tanstack/react-query';
import { createReviewInfiniteQueryOptions } from '@entities/review/config/reviewQueryKeys';

export function useReviewQuery(targetId: string) {
  return useInfiniteQuery(createReviewInfiniteQueryOptions(targetId));
}

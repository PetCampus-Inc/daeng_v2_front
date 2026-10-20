'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { INQUIRY_PAGE_SIZE } from '../config/inquiry';
import { getInquiries } from './inquiry';

const INQUIRIES_QUERY_KEY = 'inquiries';

const inquiriesQueryKeys = {
  /** 페이지 크기와 상관없이 이 사용자의 목록 전체. 무효화할 때 씀 */
  byUser: (userId?: string) => [INQUIRIES_QUERY_KEY, userId] as const,
  list: (userId?: string, size: number = INQUIRY_PAGE_SIZE) => [...inquiriesQueryKeys.byUser(userId), size] as const,
} as const;

interface UseInquiriesInfiniteQueryOptions {
  userId?: string;
  size?: number;
  enabled?: boolean;
}

/** 내 문의 목록 (커서 기반 무한 스크롤). userId가 없으면 요청하지 않음 */
function useInquiriesInfiniteQuery({
  userId,
  size = INQUIRY_PAGE_SIZE,
  enabled = true,
}: UseInquiriesInfiniteQueryOptions) {
  return useInfiniteQuery({
    queryKey: inquiriesQueryKeys.list(userId, size),
    queryFn: async ({ pageParam }) => {
      const response = await getInquiries({ cursor: pageParam, size });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined),
    enabled: enabled && Boolean(userId),
  });
}

export { inquiriesQueryKeys, useInquiriesInfiniteQuery };

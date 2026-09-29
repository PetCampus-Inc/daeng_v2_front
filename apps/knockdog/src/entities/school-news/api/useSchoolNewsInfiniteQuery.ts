'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import {
  parseSchoolId,
  SCHOOL_NEWS_MAX_PAGES,
  SCHOOL_NEWS_PAGE_SIZE,
  toSchoolNewsPage,
  type SchoolNewsItem,
  type SchoolNewsPage,
} from '../model/schoolNews';
import { getSchoolNews } from './schoolNews';

const SCHOOL_NEWS_QUERY_KEY = 'schoolNews';

const schoolNewsQueryKey = (schoolId?: number | null, size: number = SCHOOL_NEWS_PAGE_SIZE) =>
  [SCHOOL_NEWS_QUERY_KEY, schoolId, size] as const;

interface UseSchoolNewsInfiniteQueryOptions {
  schoolId?: string | number | null;
  size?: number;
  enabled?: boolean;
}

function useSchoolNewsInfiniteQuery({
  schoolId,
  size = SCHOOL_NEWS_PAGE_SIZE,
  enabled = true,
}: UseSchoolNewsInfiniteQueryOptions) {
  const parsedSchoolId = parseSchoolId(schoolId);

  return useInfiniteQuery({
    queryKey: schoolNewsQueryKey(parsedSchoolId, size),
    queryFn: async ({ pageParam }) => {
      if (parsedSchoolId == null) return { items: [], nextCursor: null, hasNext: false };

      const response = await getSchoolNews({
        schoolId: parsedSchoolId,
        cursor: pageParam,
        size,
      });

      return toSchoolNewsPage(response.data);
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && parsedSchoolId != null,
    staleTime: 0,
  });
}

function flattenSchoolNewsItems(data: InfiniteData<SchoolNewsPage> | undefined) {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

function useRemoveSchoolNewsItem(schoolId?: string | number | null) {
  const queryClient = useQueryClient();
  const parsedSchoolId = parseSchoolId(schoolId);

  return useCallback(
    (newsId: string) => {
      if (parsedSchoolId == null) return;

      queryClient.setQueriesData<InfiniteData<SchoolNewsPage>>(
        { queryKey: [SCHOOL_NEWS_QUERY_KEY, parsedSchoolId] },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== newsId),
            })),
          };
        }
      );
    },
    [parsedSchoolId, queryClient]
  );
}

interface UseSchoolNewsItemOptions {
  schoolId?: string | number | null;
  newsId?: string;
  enabled?: boolean;
}

function useSchoolNewsItem({ schoolId, newsId, enabled = true }: UseSchoolNewsItemOptions) {
  const query = useSchoolNewsInfiniteQuery({
    schoolId,
    enabled: enabled && Boolean(newsId),
  });
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = query;
  const pageCount = data?.pages.length ?? 0;
  const reachedPageCap = pageCount >= SCHOOL_NEWS_MAX_PAGES;

  const item = useMemo(() => {
    if (!newsId) return null;
    return flattenSchoolNewsItems(data).find((row) => row.id === newsId) ?? null;
  }, [data, newsId]);

  useEffect(() => {
    if (!newsId || item || reachedPageCap) return;
    if (!hasNextPage || isFetching || isFetchingNextPage) return;
    fetchNextPage().catch(() => undefined);
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, item, newsId, reachedPageCap]);

  const isResolving =
    Boolean(newsId) &&
    !item &&
    !query.isError &&
    (query.isLoading || query.isFetchingNextPage || (Boolean(query.hasNextPage) && !reachedPageCap));

  return { item, isResolving, isError: query.isError };
}

function useSchoolNewsSearchSource(schoolId: string | number | null | undefined, active: boolean) {
  const query = useSchoolNewsInfiniteQuery({ schoolId, enabled: active });
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } = query;
  const pageCount = data?.pages.length ?? 0;
  const reachedPageCap = pageCount >= SCHOOL_NEWS_MAX_PAGES;

  useEffect(() => {
    if (!active || reachedPageCap) return;
    if (!hasNextPage || isFetching || isFetchingNextPage) return;
    fetchNextPage().catch(() => undefined);
  }, [active, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, reachedPageCap]);

  const items = useMemo(() => flattenSchoolNewsItems(data), [data]);
  const isSearching =
    active &&
    (query.isLoading ||
      query.isFetchingNextPage ||
      (Boolean(query.hasNextPage) && !reachedPageCap));

  return { items, isSearching };
}

export {
  SCHOOL_NEWS_QUERY_KEY,
  schoolNewsQueryKey,
  useRemoveSchoolNewsItem,
  useSchoolNewsInfiniteQuery,
  useSchoolNewsItem,
  useSchoolNewsSearchSource,
};
export type { SchoolNewsItem };

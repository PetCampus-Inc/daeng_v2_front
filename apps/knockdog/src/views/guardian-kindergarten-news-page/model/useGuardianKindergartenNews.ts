'use client';

import { useCallback, useMemo } from 'react';

import {
  formatGuardianKindergartenNewsDetailPublishedAt,
  formatGuardianKindergartenNewsPublishedAt,
  isGuardianKindergartenNewsNewBadge,
} from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';
import {
  GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE,
  GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT,
  type GuardianKindergartenNewsListItemView,
} from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

import {
  useSchoolNewsInfiniteQuery,
  useSchoolNewsPreviewQuery,
  type SchoolNewsItem,
} from '@entities/school-news';

import { useClientNow } from '@shared/lib/react/useClientNow';

interface UseGuardianKindergartenNewsOptions {
  enabled?: boolean;
}

function toListItemView(
  item: SchoolNewsItem,
  now: Date | null
): GuardianKindergartenNewsListItemView {
  const publishedAt = new Date(item.publishedAt);

  return {
    id: item.id,
    title: item.title,
    body: item.body,
    publishedAt: item.publishedAt,
    isAnnouncement: item.isAnnouncement,
    imageUrls: item.imageUrls,
    author: {
      name: item.authorName,
      profileImageUrl: item.authorProfileImageUrl,
    },
    publishedAtLabel: now
      ? formatGuardianKindergartenNewsPublishedAt(publishedAt, now)
      : formatGuardianKindergartenNewsDetailPublishedAt(publishedAt, publishedAt),
    showNewBadge: now ? isGuardianKindergartenNewsNewBadge(publishedAt, now) : false,
  };
}

/**
 * 보호자 유치원 소식 목록.
 * - GET /schools/{schoolId}/news
 * - 서버 정렬(공지 우선 + 최신순) 유지, cursor 무한스크롤
 */
function useGuardianKindergartenNews(
  schoolId?: string,
  { enabled = true }: UseGuardianKindergartenNewsOptions = {}
) {
  const newsQuery = useSchoolNewsInfiniteQuery({
    schoolId,
    size: GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE,
    enabled,
  });
  const now = useClientNow(newsQuery.dataUpdatedAt);

  const items = useMemo(() => {
    const sourceItems = newsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return sourceItems.map((item) => toListItemView(item, now));
  }, [newsQuery.data, now]);

  const refresh = useCallback(async () => {
    await newsQuery.refetch();
  }, [newsQuery]);

  return {
    items,
    hasNews: items.length > 0,
    hasNextPage: Boolean(newsQuery.hasNextPage),
    isFetchingNextPage: newsQuery.isFetchingNextPage,
    isPending: enabled && newsQuery.isLoading,
    isFetching: newsQuery.isFetching,
    isError: newsQuery.isError,
    fetchNextPage: newsQuery.fetchNextPage,
    refresh,
    refetch: newsQuery.refetch,
  };
}

/** 홈 프리뷰 — GET /schools/{schoolId}/news/preview */
function useGuardianNewsPreview(schoolId?: string) {
  const previewQuery = useSchoolNewsPreviewQuery({ schoolId });
  const now = useClientNow(previewQuery.dataUpdatedAt);

  const items = useMemo(() => {
    const sourceItems = previewQuery.data?.items ?? [];
    return sourceItems
      .slice(0, GUARDIAN_KINDERGARTEN_NEWS_PREVIEW_LIMIT)
      .map((item) => toListItemView(item, now));
  }, [now, previewQuery.data]);

  return {
    items,
    isPending: previewQuery.isLoading,
  };
}

export { useGuardianKindergartenNews, useGuardianNewsPreview };

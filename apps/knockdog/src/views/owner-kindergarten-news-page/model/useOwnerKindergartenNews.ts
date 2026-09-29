'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  formatOwnerKindergartenNewsDetailPublishedAt,
  formatOwnerKindergartenNewsPublishedAt,
  isOwnerKindergartenNewsNewBadge,
} from '@views/owner-kindergarten-news-page/lib/formatOwnerKindergartenNewsPublishedAt';
import {
  OWNER_KINDERGARTEN_NEWS_PAGE_SIZE,
  type OwnerKindergartenNewsItem,
  type OwnerKindergartenNewsListItemView,
} from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

import { useOwnerHomeQuery } from '@entities/owner-home';
import {
  useRemoveSchoolNewsItem,
  useSchoolNewsInfiniteQuery,
  type SchoolNewsItem,
} from '@entities/school-news';
import { useUserStore } from '@entities/user';

import { useClientNow } from '@shared/lib/react/useClientNow';

function toOwnerNewsItem(item: SchoolNewsItem): OwnerKindergartenNewsItem {
  return {
    id: item.id,
    isAnnouncement: item.isAnnouncement,
    publishedAt: item.publishedAt,
    readCount: item.readCount,
    guardianTotalCount: item.guardianTotalCount,
    title: item.title,
    body: item.body,
    thumbnailUrl: item.thumbnailUrl,
    imageUrls: item.imageUrls,
    readers: [],
  };
}

function toListItemView(
  item: SchoolNewsItem,
  now: Date | null
): OwnerKindergartenNewsListItemView {
  const publishedAt = new Date(item.publishedAt);

  return {
    ...toOwnerNewsItem(item),
    publishedAtLabel: now
      ? formatOwnerKindergartenNewsPublishedAt(publishedAt, now)
      : formatOwnerKindergartenNewsDetailPublishedAt(publishedAt, publishedAt),
    showNewBadge: now ? isOwnerKindergartenNewsNewBadge(publishedAt, now) : false,
  };
}

/**
 * 원장 유치원 소식 목록.
 * - GET /schools/{schoolId}/news
 * - 서버 정렬(공지 우선 + 최신순) 유지, cursor 무한스크롤
 * - empty: `/owner/news?empty=1`
 */
function useOwnerKindergartenNews() {
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';
  const userId = useUserStore((state) => state.user?.userId);
  const { data: ownerHome, isPending: isHomePending, isFetching: isHomeFetching } = useOwnerHomeQuery({
    userId,
  });
  const schoolId = ownerHome?.school.schoolId ?? null;
  const newsQuery = useSchoolNewsInfiniteQuery({
    schoolId,
    size: OWNER_KINDERGARTEN_NEWS_PAGE_SIZE,
    enabled: !forceEmpty,
  });
  const removeNewsItem = useRemoveSchoolNewsItem(schoolId);
  const now = useClientNow(newsQuery.dataUpdatedAt);

  const sourceItems = useMemo(
    () => newsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [newsQuery.data]
  );

  const items = useMemo(() => {
    if (forceEmpty) return [];
    return sourceItems.map((item) => toListItemView(item, now));
  }, [forceEmpty, now, sourceItems]);

  const refresh = useCallback(async () => {
    await newsQuery.refetch();
  }, [newsQuery]);

  const deleteNews = useCallback(
    async (newsId: string) => {
      removeNewsItem(newsId);
    },
    [removeNewsItem]
  );

  return {
    items,
    hasNews: items.length > 0,
    hasNextPage: Boolean(newsQuery.hasNextPage) && !forceEmpty,
    isFetchingNextPage: newsQuery.isFetchingNextPage,
    isPending: isHomePending || newsQuery.isLoading,
    isFetching: isHomeFetching || newsQuery.isFetching,
    isError: newsQuery.isError,
    fetchNextPage: newsQuery.fetchNextPage,
    refresh,
    deleteNews,
    refetch: newsQuery.refetch,
  };
}

export { useOwnerKindergartenNews };

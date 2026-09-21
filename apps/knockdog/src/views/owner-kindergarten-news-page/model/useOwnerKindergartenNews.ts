'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { MOCK_OWNER_KINDERGARTEN_NEWS } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsMock';
import {
  formatOwnerKindergartenNewsPublishedAt,
  isOwnerKindergartenNewsNewBadge,
} from '@views/owner-kindergarten-news-page/lib/formatOwnerKindergartenNewsPublishedAt';
import { sortOwnerKindergartenNews } from '@views/owner-kindergarten-news-page/lib/sortOwnerKindergartenNews';
import {
  OWNER_KINDERGARTEN_NEWS_PAGE_SIZE,
  type OwnerKindergartenNewsItem,
  type OwnerKindergartenNewsListItemView,
} from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

const MOCK_FETCH_DELAY_MS = 350;

function toListItemView(item: OwnerKindergartenNewsItem, now: Date): OwnerKindergartenNewsListItemView {
  const publishedAt = new Date(item.publishedAt);

  return {
    ...item,
    publishedAtLabel: formatOwnerKindergartenNewsPublishedAt(publishedAt, now),
    showNewBadge: isOwnerKindergartenNewsNewBadge(publishedAt, now),
  };
}

/**
 * 소식 목록 (API 전 mock).
 * - 공지 최상단 + 신규등록순
 * - 페이지당 30건, 하단 도달 시 추가 조회
 * - empty: `/owner/news?empty=1`
 */
function useOwnerKindergartenNews() {
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';
  const [sourceItems, setSourceItems] = useState<OwnerKindergartenNewsItem[]>(() =>
    sortOwnerKindergartenNews(MOCK_OWNER_KINDERGARTEN_NEWS)
  );
  const [visibleCount, setVisibleCount] = useState(OWNER_KINDERGARTEN_NEWS_PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedSource = useMemo(() => {
    if (forceEmpty) return [];
    return sourceItems;
  }, [forceEmpty, sourceItems]);

  useEffect(() => {
    setVisibleCount(OWNER_KINDERGARTEN_NEWS_PAGE_SIZE);
  }, [forceEmpty]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  const hasNextPage = visibleCount < sortedSource.length;

  const items = useMemo(() => {
    const now = new Date();
    return sortedSource.slice(0, visibleCount).map((item) => toListItemView(item, now));
  }, [sortedSource, visibleCount]);

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    fetchTimeoutRef.current = setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + OWNER_KINDERGARTEN_NEWS_PAGE_SIZE, sortedSource.length)
      );
      setIsFetchingNextPage(false);
    }, MOCK_FETCH_DELAY_MS);
  }, [hasNextPage, isFetchingNextPage, sortedSource.length]);

  const deleteNews = useCallback(async (newsId: string) => {
    setSourceItems((current) => current.filter((item) => item.id !== newsId));
  }, []);

  return {
    items,
    hasNews: sortedSource.length > 0,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    deleteNews,
  };
}

export { useOwnerKindergartenNews };

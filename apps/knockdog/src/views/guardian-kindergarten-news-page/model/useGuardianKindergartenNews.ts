'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  getGuardianKindergartenNewsSource,
  toListItemView,
} from '@views/guardian-kindergarten-news-page/model/getGuardianKindergartenNewsPreview';
import {
  GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE,
  type GuardianKindergartenNewsListItemView,
} from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';

const MOCK_FETCH_DELAY_MS = 350;

/**
 * 보호자 소식 목록 (API 전 mock).
 * - 공지 최상단 + 신규등록순
 * - 페이지당 30건, 하단 도달 시 추가 조회
 * - empty: `/compare/news?empty=1`
 */
function useGuardianKindergartenNews() {
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';
  const [visibleCount, setVisibleCount] = useState(GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedSource = useMemo(() => {
    if (forceEmpty) return [];
    return getGuardianKindergartenNewsSource();
  }, [forceEmpty]);

  useEffect(() => {
    setVisibleCount(GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE);
  }, [forceEmpty]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  const hasNextPage = visibleCount < sortedSource.length;

  const items: GuardianKindergartenNewsListItemView[] = useMemo(() => {
    const now = new Date();
    return sortedSource.slice(0, visibleCount).map((item) => toListItemView(item, now));
  }, [sortedSource, visibleCount]);

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    fetchTimeoutRef.current = setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE, sortedSource.length)
      );
      setIsFetchingNextPage(false);
    }, MOCK_FETCH_DELAY_MS);
  }, [hasNextPage, isFetchingNextPage, sortedSource.length]);

  return {
    items,
    hasNews: sortedSource.length > 0,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
}

export { useGuardianKindergartenNews };

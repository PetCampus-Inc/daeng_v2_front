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
import { useClientNow } from '@shared/lib/react/useClientNow';

const MOCK_FETCH_DELAY_MS = 350;
const MOCK_REFRESH_DELAY_MS = 700;

/**
 * 보호자 소식 목록 (API 전 mock).
 * - 공지 최상단 + 신규등록순
 * - 페이지당 30건, 하단 도달 시 추가 조회
 * - pull-to-refresh: 1페이지부터 재조회
 * - empty: `/compare/news?empty=1`
 */
function useGuardianKindergartenNews() {
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';
  const [visibleCount, setVisibleCount] = useState(GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const now = useClientNow(refreshTick);

  const sortedSource = useMemo(() => {
    if (forceEmpty) return [];
    return getGuardianKindergartenNewsSource();
  }, [forceEmpty, refreshTick]);

  useEffect(() => {
    setVisibleCount(GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE);
  }, [forceEmpty]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []);

  const hasNextPage = visibleCount < sortedSource.length;

  const items: GuardianKindergartenNewsListItemView[] = useMemo(() => {
    return sortedSource.slice(0, visibleCount).map((item) => toListItemView(item, now));
  }, [sortedSource, visibleCount, now]);

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

  /** 최상단 당겨서 새로고침 — 1페이지부터 재조회 */
  const refresh = useCallback(async () => {
    await new Promise<void>((resolve) => {
      refreshTimeoutRef.current = setTimeout(() => {
        setVisibleCount(GUARDIAN_KINDERGARTEN_NEWS_PAGE_SIZE);
        setRefreshTick((tick) => tick + 1);
        resolve();
      }, MOCK_REFRESH_DELAY_MS);
    });
  }, []);

  return {
    items,
    hasNews: sortedSource.length > 0,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refresh,
  };
}

export { useGuardianKindergartenNews };

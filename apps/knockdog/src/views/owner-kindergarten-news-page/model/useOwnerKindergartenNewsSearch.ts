'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { formatOwnerKindergartenNewsDetailPublishedAt } from '@views/owner-kindergarten-news-page/lib/formatOwnerKindergartenNewsPublishedAt';
import {
  getOwnerKindergartenNewsSource,
  subscribeOwnerKindergartenNews,
} from '@views/owner-kindergarten-news-page/model/ownerKindergartenNewsStore';
import { filterKindergartenNewsByQuery } from '@shared/lib/search';

interface OwnerKindergartenNewsSearchResultView {
  id: string;
  title: string;
  body: string;
  publishedAtLabel: string;
  thumbnailUrl: string | null;
}

/**
 * 원장 소식 검색
 * - 제목·본문 통합 검색
 * - 최신 등록순 (공지 핀 무시)
 */
function useOwnerKindergartenNewsSearch(query: string) {
  const trimmedQuery = query.trim();
  const source = useSyncExternalStore(
    subscribeOwnerKindergartenNews,
    getOwnerKindergartenNewsSource,
    getOwnerKindergartenNewsSource
  );

  const results = useMemo((): OwnerKindergartenNewsSearchResultView[] => {
    if (!trimmedQuery) return [];

    const matched = filterKindergartenNewsByQuery(source, trimmedQuery);

    return matched.map((item) => {
      const publishedAt = new Date(item.publishedAt);
      return {
        id: item.id,
        title: item.title,
        body: item.body,
        publishedAtLabel: formatOwnerKindergartenNewsDetailPublishedAt(publishedAt),
        thumbnailUrl: item.thumbnailUrl ?? item.imageUrls[0] ?? null,
      };
    });
  }, [source, trimmedQuery]);

  return {
    query: trimmedQuery,
    results,
    hasQuery: trimmedQuery.length > 0,
    hasResults: results.length > 0,
  };
}

export { useOwnerKindergartenNewsSearch };
export type { OwnerKindergartenNewsSearchResultView };

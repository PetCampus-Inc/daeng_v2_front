'use client';

import { useMemo } from 'react';

import { formatGuardianKindergartenNewsDetailPublishedAt } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';
import { getGuardianKindergartenNewsSource } from '@views/guardian-kindergarten-news-page/model/getGuardianKindergartenNewsPreview';
import { filterKindergartenNewsByQuery } from '@shared/lib/search';

interface GuardianKindergartenNewsSearchResultView {
  id: string;
  title: string;
  body: string;
  publishedAtLabel: string;
  thumbnailUrl: string | null;
}

/**
 * 보호자 소식 검색
 * - 제목·본문 통합 검색
 * - 최신 등록순 (공지 핀 무시)
 */
function useGuardianKindergartenNewsSearch(query: string) {
  const trimmedQuery = query.trim();

  const results = useMemo((): GuardianKindergartenNewsSearchResultView[] => {
    if (!trimmedQuery) return [];

    const matched = filterKindergartenNewsByQuery(getGuardianKindergartenNewsSource(), trimmedQuery);

    return matched.map((item) => {
      const publishedAt = new Date(item.publishedAt);
      return {
        id: item.id,
        title: item.title,
        body: item.body,
        publishedAtLabel: formatGuardianKindergartenNewsDetailPublishedAt(publishedAt),
        thumbnailUrl: item.imageUrls[0] ?? null,
      };
    });
  }, [trimmedQuery]);

  return {
    query: trimmedQuery,
    results,
    hasQuery: trimmedQuery.length > 0,
    hasResults: results.length > 0,
  };
}

export { useGuardianKindergartenNewsSearch };
export type { GuardianKindergartenNewsSearchResultView };

'use client';

import { useMemo } from 'react';

import { formatGuardianKindergartenNewsDetailPublishedAt } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';

import { useSchoolNewsSearchSource } from '@entities/school-news';

interface GuardianKindergartenNewsSearchResultView {
  id: string;
  title: string;
  body: string;
  publishedAtLabel: string;
  thumbnailUrl: string | null;
}

/**
 * 보호자 소식 검색
 * - GET /schools/{schoolId}/news/search
 * - 제목·본문 통합 검색, 최신 등록순
 */
function useGuardianKindergartenNewsSearch(query: string, schoolId?: string) {
  const trimmedQuery = query.trim();
  const { items, isSearching } = useSchoolNewsSearchSource(schoolId, trimmedQuery);

  const results = useMemo((): GuardianKindergartenNewsSearchResultView[] => {
    if (!trimmedQuery) return [];

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      publishedAtLabel: formatGuardianKindergartenNewsDetailPublishedAt(new Date(item.publishedAt)),
      thumbnailUrl: item.thumbnailUrl,
    }));
  }, [items, trimmedQuery]);

  return {
    query: trimmedQuery,
    results,
    hasQuery: trimmedQuery.length > 0,
    hasResults: results.length > 0,
    isSearching,
  };
}

export { useGuardianKindergartenNewsSearch };
export type { GuardianKindergartenNewsSearchResultView };

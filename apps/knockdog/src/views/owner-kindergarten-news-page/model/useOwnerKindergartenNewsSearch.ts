'use client';

import { useMemo } from 'react';

import { formatOwnerKindergartenNewsDetailPublishedAt } from '@views/owner-kindergarten-news-page/lib/formatOwnerKindergartenNewsPublishedAt';

import { useOwnerHomeQuery } from '@entities/owner-home';
import { useSchoolNewsSearchSource } from '@entities/school-news';
import { useUserStore } from '@entities/user';

interface OwnerKindergartenNewsSearchResultView {
  id: string;
  title: string;
  body: string;
  publishedAtLabel: string;
  thumbnailUrl: string | null;
}

/**
 * 원장 소식 검색
 * - GET /schools/{schoolId}/news/search
 * - 제목/본문 통합 검색, 최신 등록순
 */
function useOwnerKindergartenNewsSearch(query: string) {
  const trimmedQuery = query.trim();
  const userId = useUserStore((state) => state.user?.userId);
  const { data: ownerHome, isPending: isHomePending } = useOwnerHomeQuery({ userId });
  const schoolId = ownerHome?.school.schoolId ?? null;
  const { items, isSearching } = useSchoolNewsSearchSource(schoolId, trimmedQuery);

  const results = useMemo((): OwnerKindergartenNewsSearchResultView[] => {
    if (!trimmedQuery) return [];

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      publishedAtLabel: formatOwnerKindergartenNewsDetailPublishedAt(new Date(item.publishedAt)),
      thumbnailUrl: item.thumbnailUrl,
    }));
  }, [items, trimmedQuery]);

  return {
    query: trimmedQuery,
    results,
    hasQuery: trimmedQuery.length > 0,
    hasResults: results.length > 0,
    isSearching: trimmedQuery.length > 0 && (isHomePending || isSearching),
  };
}

export { useOwnerKindergartenNewsSearch };
export type { OwnerKindergartenNewsSearchResultView };

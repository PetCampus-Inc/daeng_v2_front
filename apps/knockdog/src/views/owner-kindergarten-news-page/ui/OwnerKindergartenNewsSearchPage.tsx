'use client';

import { useCallback, Suspense } from 'react';
import { useQueryState } from 'nuqs';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { useOwnerKindergartenNewsSearch } from '@views/owner-kindergarten-news-page/model/useOwnerKindergartenNewsSearch';
import { RecentSearchKeywordSection } from '@features/search';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { useKindergartenNewsSearchHistory } from '@shared/store';
import { KindergartenNewsSearchEmptyResult } from '@shared/ui/kindergarten-news-search-empty-result';
import { KindergartenNewsSearchResultItem } from '@shared/ui/kindergarten-news-search-result-item';
import { Header } from '@widgets/Header';

/**
 * 원장 유치원 소식 검색
 * - 제목·본문 통합 검색, 최신 등록순 (공지 핀 무시)
 * - 검색어 없을 때: 최근 검색어 (내 주변 검색과 동일 UI) / empty
 * - 결과 탭 → 상세, 상세 뒤로가기 → 검색 결과 유지 (q URL 동기화)
 */
function OwnerKindergartenNewsSearchPageContent() {
  const { search } = ownerKindergartenNewsContent;
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const { back, push } = useStackNavigation();
  const { results, hasQuery, hasResults } = useOwnerKindergartenNewsSearch(query);
  const {
    recentKeywords,
    hasRecentKeywords,
    addRecentKeyword,
    removeRecentKeyword,
    clearRecentKeywords,
  } = useKindergartenNewsSearchHistory();

  const handleBack = useCallback(() => {
    void (async () => {
      try {
        const wentBack = await back();
        if (wentBack) return;
      } catch {
        // fall through
      }

      void push({ pathname: route.owner.news.root });
    })();
  }, [back, push]);

  useNativeBackHandler(handleBack);

  const commitQuery = useCallback(
    (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      void setQuery(trimmed || null);
      if (trimmed) addRecentKeyword(trimmed);
    },
    [addRecentKeyword, setQuery]
  );

  const handleResultClick = (newsId: string) => {
    if (query.trim()) addRecentKeyword(query);
    void push({
      pathname: route.owner.news.detail.root.replace('[id]', newsId),
    });
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.SearchField
          value={query}
          onChange={(value) => {
            void setQuery(value || null);
          }}
          onSubmit={commitQuery}
          placeholder={search.placeholder}
        />
      </Header>

      <main className='flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain'>
        {!hasQuery ? (
          hasRecentKeywords ? (
            <RecentSearchKeywordSection
              className='mt-4'
              keywords={recentKeywords}
              title={search.recentTitle}
              clearAllLabel={search.clearAllLabel}
              onSelect={commitQuery}
              onRemove={removeRecentKeyword}
              onClearAll={clearRecentKeywords}
            />
          ) : (
            <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
              <p className='h2-semibold text-text-caption text-center'>{search.emptyRecent}</p>
            </div>
          )
        ) : hasResults ? (
          <div>
            {results.map((item) => (
              <KindergartenNewsSearchResultItem
                key={item.id}
                publishedAtLabel={item.publishedAtLabel}
                title={item.title}
                body={item.body}
                thumbnailUrl={item.thumbnailUrl}
                highlightQuery={query}
                onClick={() => handleResultClick(item.id)}
              />
            ))}
          </div>
        ) : (
          <KindergartenNewsSearchEmptyResult
            title={search.emptyResult.title}
            description={search.emptyResult.description}
            imageSrc={search.emptyResult.imageSrc}
            imageAlt={search.emptyResult.imageAlt}
          />
        )}
      </main>
    </div>
  );
}

function OwnerKindergartenNewsSearchPage() {
  return (
    <Suspense fallback={null}>
      <OwnerKindergartenNewsSearchPageContent />
    </Suspense>
  );
}

export { OwnerKindergartenNewsSearchPage };

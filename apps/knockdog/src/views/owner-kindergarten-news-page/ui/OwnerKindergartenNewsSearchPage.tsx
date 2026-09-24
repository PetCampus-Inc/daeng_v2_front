'use client';

import { useCallback, Suspense } from 'react';
import { useQueryState } from 'nuqs';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { useOwnerKindergartenNewsSearch } from '@views/owner-kindergarten-news-page/model/useOwnerKindergartenNewsSearch';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';
import { KindergartenNewsSearchResultItem } from '@shared/ui/kindergarten-news-search-result-item';
import { Header } from '@widgets/Header';

/**
 * 원장 유치원 소식 검색
 * - 제목·본문 통합 검색, 최신 등록순 (공지 핀 무시)
 * - 결과 탭 → 상세, 상세 뒤로가기 → 검색 결과 유지 (q URL 동기화)
 */
function OwnerKindergartenNewsSearchPageContent() {
  const { search } = ownerKindergartenNewsContent;
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const { back, push } = useStackNavigation();
  const { results, hasQuery, hasResults } = useOwnerKindergartenNewsSearch(query);

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

  const handleResultClick = (newsId: string) => {
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
          placeholder={search.placeholder}
        />
      </Header>

      <main className='flex min-h-0 flex-1 flex-col'>
        {!hasQuery ? (
          <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
            <p className='h2-semibold text-text-caption text-center'>{search.emptyRecent}</p>
          </div>
        ) : hasResults ? (
          <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
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
          <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
            <p className='h2-semibold text-text-caption text-center'>{search.emptyResult}</p>
          </div>
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

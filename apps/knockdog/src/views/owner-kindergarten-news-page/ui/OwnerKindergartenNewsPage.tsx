'use client';

import { useCallback, Suspense } from 'react';
import { Icon } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { useOwnerKindergartenNews } from '@views/owner-kindergarten-news-page/model/useOwnerKindergartenNews';
import { OwnerKindergartenNewsWriteButton } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsWriteButton';
import { OwnerKindergartenNewsEmptyState } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsEmptyState';
import { OwnerKindergartenNewsList } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsList';
import { useNativeBackHandler, useTabNavigation } from '@shared/lib/bridge';
import { PullToRefresh } from '@shared/ui/pull-to-refresh';
import { Header } from '@widgets/Header';

/**
 * 원장 유치원 소식 페이지
 * - 기본: mock 목록 (공지 최상단 + 신규순, 30건 무한스크롤)
 * - empty: `/owner/news?empty=1`
 * - 헤더/시스템 뒤로가기 → 원장 홈 탭
 *
 * useHistoryBackTrap 미사용: Strict Mode remount 시 trap pop이
 * navigateToTab('/owner')를 즉시 호출해 진입 직후 홈으로 튕김.
 */
function OwnerKindergartenNewsPageContent() {
  const { navigateToTab } = useTabNavigation();
  const { items, hasNews, hasNextPage, isFetchingNextPage, fetchNextPage, refresh, deleteNews } =
    useOwnerKindergartenNews();

  const handleBack = useCallback(() => {
    void navigateToTab('/owner');
  }, [navigateToTab]);

  useNativeBackHandler(handleBack);

  return (
    <div data-testid='owner-kindergarten-news-root' className='bg-bg-50 flex h-full flex-col'>
      <div className='bg-bg-0'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{ownerKindergartenNewsContent.pageTitle}</Header.Title>
          <Header.RightSection>
            <button
              type='button'
              aria-label={ownerKindergartenNewsContent.searchAriaLabel}
              className='inline-flex size-6 items-center justify-center'
            >
              <Icon icon='Search' className='text-text-primary size-6' />
            </button>
          </Header.RightSection>
        </Header>
      </div>

      <main className={`${hasNews ? 'bg-bg-0' : 'bg-bg-50'} relative flex min-h-0 flex-1 flex-col`}>
        {hasNews ? (
          <PullToRefresh onRefresh={refresh}>
            <OwnerKindergartenNewsList
              items={items}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              onDelete={deleteNews}
            />
          </PullToRefresh>
        ) : (
          <OwnerKindergartenNewsEmptyState />
        )}
        <OwnerKindergartenNewsWriteButton openAsEmpty={!hasNews} />
      </main>
    </div>
  );
}

function OwnerKindergartenNewsPage() {
  return (
    <Suspense fallback={null}>
      <OwnerKindergartenNewsPageContent />
    </Suspense>
  );
}

export { OwnerKindergartenNewsPage };

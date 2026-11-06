'use client';

import { useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@knockdog/ui';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { formatGuardianKindergartenNewsPageTitle } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPageTitle';
import { useGuardianKindergartenNews } from '@views/guardian-kindergarten-news-page/model/useGuardianKindergartenNews';
import { GuardianKindergartenNewsEmptyState } from '@views/guardian-kindergarten-news-page/ui/GuardianKindergartenNewsEmptyState';
import { GuardianKindergartenNewsList } from '@views/guardian-kindergarten-news-page/ui/GuardianKindergartenNewsList';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { PullToRefresh } from '@shared/ui/pull-to-refresh';
import { Header } from '@widgets/Header';

function GuardianKindergartenNewsPageContent() {
  const content = guardianKindergartenNewsContent;
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId')?.trim() || undefined;
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { linkedKindergarten, isHomeReady } = useGuardianKindergartenHome();
  const resolvedSchoolId = schoolId ?? linkedKindergarten?.id;
  const forceEmpty = searchParams.get('empty') === '1';
  const {
    items,
    hasNews,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isFetching,
    isError,
    fetchNextPage,
    refresh,
    refetch,
  } = useGuardianKindergartenNews(resolvedSchoolId, {
    enabled: !forceEmpty && (Boolean(schoolId) || isHomeReady),
  });
  const showPending = isPending || (!forceEmpty && !resolvedSchoolId && !isHomeReady);

  const kindergartenName =
    linkedKindergarten && (!schoolId || linkedKindergarten.id === schoolId)
      ? linkedKindergarten.name
      : null;
  const pageTitle = formatGuardianKindergartenNewsPageTitle(kindergartenName);

  const handleBack = useCallback(() => {
    void (async () => {
      try {
        const wentBack = await back();
        if (wentBack) return;
      } catch {
        // fall through
      }
      void navigateToTab('/compare');
    })();
  }, [back, navigateToTab]);

  useNativeBackHandler(handleBack);

  const handleSearchClick = () => {
    void push({
      pathname: route.compare.news.search.root,
      query: schoolId ? { schoolId } : undefined,
    });
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <div className='bg-bg-0 border-line-100 border-b'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{pageTitle}</Header.Title>
          {hasNews ? (
            <Header.RightSection>
              <button
                type='button'
                aria-label={content.searchAriaLabel}
                className='inline-flex size-6 items-center justify-center'
                onClick={handleSearchClick}
              >
                <Icon icon='Search' className='text-text-primary size-6' />
              </button>
            </Header.RightSection>
          ) : null}
        </Header>
      </div>

      <main className={`${hasNews ? 'bg-bg-50' : 'bg-bg-0'} relative flex min-h-0 flex-1 flex-col`}>
        {showPending ? (
          <DelayedLoadingSpinner isLoading layout='content' />
        ) : isError ? (
          <PageError layout='inline' onRetry={() => void refetch()} isRetrying={isFetching} />
        ) : hasNews ? (
          <PullToRefresh onRefresh={refresh}>
            <GuardianKindergartenNewsList
              items={items}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              schoolId={resolvedSchoolId}
            />
          </PullToRefresh>
        ) : (
          <GuardianKindergartenNewsEmptyState />
        )}
      </main>
    </div>
  );
}

function GuardianKindergartenNewsPage() {
  return (
    <Suspense fallback={null}>
      <GuardianKindergartenNewsPageContent />
    </Suspense>
  );
}

export { GuardianKindergartenNewsPage };

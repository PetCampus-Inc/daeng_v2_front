'use client';

import { useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { formatGuardianKindergartenNewsPageTitle } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPageTitle';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { Header } from '@widgets/Header';

/** 소식 검색 화면 — UI 스캐폴딩 (검색 로직 후속) */
function GuardianKindergartenNewsSearchPageContent() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId')?.trim() || undefined;
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { linkedKindergarten } = useGuardianKindergartenHome();

  const kindergartenName =
    linkedKindergarten && (!schoolId || linkedKindergarten.id === schoolId)
      ? linkedKindergarten.name
      : null;
  const pageTitle = formatGuardianKindergartenNewsPageTitle(kindergartenName);

  const handleBack = useCallback(() => {
    void back().catch(() => {
      void push({
        pathname: route.compare.news.root,
        query: schoolId ? { schoolId } : undefined,
      }).catch(() => {
        void navigateToTab('/compare');
      });
    });
  }, [back, navigateToTab, push, schoolId]);

  useNativeBackHandler(handleBack);

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{pageTitle}</Header.Title>
      </Header>
      <main className='flex min-h-0 flex-1 items-center justify-center px-4'>
        <p className='body1-regular text-text-tertiary text-center'>소식 검색</p>
      </main>
    </div>
  );
}

function GuardianKindergartenNewsSearchPage() {
  return (
    <Suspense fallback={null}>
      <GuardianKindergartenNewsSearchPageContent />
    </Suspense>
  );
}

export { GuardianKindergartenNewsSearchPage };

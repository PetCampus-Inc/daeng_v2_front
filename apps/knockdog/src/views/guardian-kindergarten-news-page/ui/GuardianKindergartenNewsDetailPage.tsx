'use client';

import { useCallback, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { formatGuardianKindergartenNewsPageTitle } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPageTitle';
import { formatGuardianKindergartenNewsPublishedAt } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';
import { getGuardianKindergartenNewsById } from '@views/guardian-kindergarten-news-page/model/getGuardianKindergartenNewsPreview';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { Header } from '@widgets/Header';

function GuardianKindergartenNewsDetailPageContent() {
  const content = guardianKindergartenNewsContent;
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId')?.trim() || undefined;
  const newsId = typeof params.id === 'string' ? params.id : '';
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const { linkedKindergarten } = useGuardianKindergartenHome();

  const item = useMemo(() => (newsId ? getGuardianKindergartenNewsById(newsId) : null), [newsId]);

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
        // fall through — stack 없음/실패와 동일하게 fallback
      }

      try {
        await push({
          pathname: route.compare.news.root,
          query: schoolId ? { schoolId } : undefined,
        });
      } catch {
        void navigateToTab('/compare');
      }
    })();
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

      <main className='min-h-0 flex-1 overflow-y-auto px-4 py-5'>
        {item ? (
          <article className='flex w-full flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1'>
                {item.showNewBadge ? (
                  <span
                    className='bg-text-accent size-2 shrink-0 rounded'
                    aria-label={content.newBadgeAriaLabel}
                  />
                ) : null}
                <h1 className='h3-extrabold text-text-primary'>{item.title}</h1>
              </div>
              <p className='body2-semibold text-text-secondary'>
                {formatGuardianKindergartenNewsPublishedAt(new Date(item.publishedAt))}
              </p>
            </div>
            <p className='body1-regular text-text-primary whitespace-pre-wrap'>{item.body}</p>
          </article>
        ) : (
          <div className='flex flex-col items-center justify-center gap-1 py-20'>
            <p className='body1-bold text-text-secondary text-center'>{content.emptyTitle}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function GuardianKindergartenNewsDetailPage() {
  return (
    <Suspense fallback={null}>
      <GuardianKindergartenNewsDetailPageContent />
    </Suspense>
  );
}

export { GuardianKindergartenNewsDetailPage };

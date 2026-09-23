'use client';

import { useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { getGuardianKindergartenNewsList } from '@views/guardian-kindergarten-news-page/model/getGuardianKindergartenNewsPreview';
import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { Header } from '@widgets/Header';

function GuardianKindergartenNewsPageContent() {
  const content = guardianKindergartenNewsContent;
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId')?.trim() || undefined;
  const { back, push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const items = useMemo(() => getGuardianKindergartenNewsList(), []);

  const handleBack = useCallback(() => {
    void back().catch(() => {
      void navigateToTab('/compare');
    });
  }, [back, navigateToTab]);

  useNativeBackHandler(handleBack);

  const handleItemClick = (newsId: string) => {
    push({
      pathname: route.compare.news.detail.root.replace('[id]', newsId),
      query: schoolId ? { schoolId } : undefined,
    });
  };

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{content.pageTitle}</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto'>
        {items.length > 0 ? (
          <ul className='flex w-full flex-col'>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type='button'
                  className='border-line-200 flex w-full flex-col items-start gap-1 border-b px-4 py-4 text-left'
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className='flex w-full items-center gap-1'>
                    {item.showNewBadge ? (
                      <span
                        className='bg-text-accent size-2 shrink-0 rounded'
                        aria-label={content.newBadgeAriaLabel}
                      />
                    ) : null}
                    <p className='body1-bold text-text-primary truncate'>{item.title}</p>
                  </div>
                  <p className='body2-regular text-text-secondary line-clamp-2 w-full whitespace-pre-wrap'>
                    {item.body}
                  </p>
                  <p className='body2-semibold text-text-secondary'>{item.publishedAtLabel}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-1 px-4 py-20'>
            <p className='body1-bold text-text-secondary text-center'>{content.emptyTitle}</p>
            <p className='body2-regular text-text-tertiary text-center'>{content.emptyDescription}</p>
          </div>
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

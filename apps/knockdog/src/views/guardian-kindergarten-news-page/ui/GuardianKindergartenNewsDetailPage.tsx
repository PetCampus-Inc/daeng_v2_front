'use client';

import { useCallback, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { guardianKindergartenNewsContent } from '@views/guardian-kindergarten-news-page/config/guardianKindergartenNewsContent';
import { formatGuardianKindergartenNewsPageTitle } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPageTitle';
import { formatGuardianKindergartenNewsDetailPublishedAt } from '@views/guardian-kindergarten-news-page/lib/formatGuardianKindergartenNewsPublishedAt';
import { GuardianKindergartenNewsDetailImageList } from '@views/guardian-kindergarten-news-page/ui/GuardianKindergartenNewsDetailImageList';
import { useGuardianKindergartenHome } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenHome';

import { useSchoolNewsDetailQuery } from '@entities/school-news';

import { route } from '@shared/constants/route';
import { useNativeBackHandler, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { useShare } from '@shared/lib/device';
import { parseNotificationEntrySource } from '@shared/lib/notification';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import { Header } from '@widgets/Header';

function showGuardianKindergartenNewsShareSuccessToast() {
  const { shareSuccessToast } = guardianKindergartenNewsContent;

  toast({
    type: 'success',
    nativeTitle: shareSuccessToast.nativeTitle,
    titleParts: [
      { text: '유치원 소식을 ' },
      { text: '공유', accent: true },
      { text: '했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>유치원 소식을 </span>
        <span className='text-text-accent'>공유</span>
        <span className='text-text-primary-inverse'>했어요</span>
      </>
    ),
  });
}

/**
 * 보호자 유치원 소식 상세
 * - 원장 상세와 동일 UI (이미지 리스트/뷰어 포함)
 * - 상세 조회가 보호자 읽음 처리
 * - 수정·삭제·읽음 반응 없음
 * - 공유: OS 공유 시트 → 완료 시 accent 토스트 (스크롤 위치 유지)
 */
function GuardianKindergartenNewsDetailPageContent() {
  const { detail } = guardianKindergartenNewsContent;
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('schoolId')?.trim() || undefined;
  const entrySource = parseNotificationEntrySource(searchParams.get('source'));
  const newsId = typeof params.id === 'string' ? params.id : '';
  const { back, push, replace } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const share = useShare();
  const { linkedKindergarten, isHomeReady } = useGuardianKindergartenHome();
  const resolvedSchoolId = schoolId ?? linkedKindergarten?.id;
  const detailQuery = useSchoolNewsDetailQuery({
    schoolId: resolvedSchoolId,
    newsId,
    enabled: Boolean(schoolId) || isHomeReady,
  });
  const newsItem = detailQuery.data ?? null;
  const isResolving = detailQuery.isLoading;
  const item = useMemo(() => {
    if (!newsItem) return null;

    return {
      id: newsItem.id,
      title: newsItem.title,
      body: newsItem.body,
      publishedAt: newsItem.publishedAt,
      imageUrls: newsItem.imageUrls,
    };
  }, [newsItem]);

  const kindergartenName =
    linkedKindergarten && (!schoolId || linkedKindergarten.id === schoolId)
      ? linkedKindergarten.name
      : null;
  const pageTitle = formatGuardianKindergartenNewsPageTitle(kindergartenName);

  const publishedAtLabel = useMemo(() => {
    if (!item) return '';
    return formatGuardianKindergartenNewsDetailPublishedAt(new Date(item.publishedAt));
  }, [item]);

  const handleBack = useCallback(() => {
    const newsListQuery = schoolId ? { schoolId } : undefined;

    if (entrySource === 'inbox' || entrySource === 'push') {
      void replace({
        pathname: route.compare.news.root,
        query: newsListQuery,
      }).catch(() => {
        void navigateToTab('/compare');
      });
      return;
    }

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
          query: newsListQuery,
        });
      } catch {
        void navigateToTab('/compare');
      }
    })();
  }, [back, entrySource, navigateToTab, push, replace, schoolId]);

  useNativeBackHandler(handleBack);

  const handleShareClick = useCallback(async () => {
    if (!item) return;

    const shareUrl =
      typeof window !== 'undefined' ? window.location.href : route.compare.news.detail.root.replace('[id]', item.id);

    const shared = await share({
      title: item.title,
      subject: item.title,
      message: item.title,
      url: shareUrl,
    });

    if (shared) showGuardianKindergartenNewsShareSuccessToast();
  }, [item, share]);

  if ((!schoolId && !isHomeReady) || isResolving) {
    return (
      <div data-testid='guardian-kindergarten-news-detail-root' className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{pageTitle}</Header.Title>
        </Header>
        <DelayedLoadingSpinner isLoading layout='content' />
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div data-testid='guardian-kindergarten-news-detail-root' className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{pageTitle}</Header.Title>
        </Header>
        <PageError
          layout='inline'
          onRetry={() => {
            detailQuery.refetch().catch(() => undefined);
          }}
          isRetrying={detailQuery.isFetching}
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div data-testid='guardian-kindergarten-news-detail-root' className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton onClick={handleBack} />
          </Header.LeftSection>
          <Header.Title>{pageTitle}</Header.Title>
        </Header>
        <main className='flex min-h-0 flex-1 items-center justify-center px-4'>
          <p className='body1-regular text-text-secondary'>{detail.notFound}</p>
        </main>
      </div>
    );
  }

  return (
    <div data-testid='guardian-kindergarten-news-detail-root' className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{pageTitle}</Header.Title>
        <Header.RightSection>
          <Header.ShareButton
            aria-label={detail.shareAriaLabel}
            onClick={() => {
              void handleShareClick();
            }}
          />
        </Header.RightSection>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-5 px-4 py-5'>
          <div className='flex flex-col gap-2'>
            <h1 className='h2-extrabold text-text-primary'>{item.title}</h1>
            <p className='label-semibold text-text-tertiary'>{publishedAtLabel}</p>
          </div>
          <p className='body1-regular text-text-primary whitespace-pre-wrap'>{item.body}</p>
        </div>

        <GuardianKindergartenNewsDetailImageList imageUrls={item.imageUrls} />
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

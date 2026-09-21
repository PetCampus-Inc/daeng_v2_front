'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { formatOwnerKindergartenNewsDetailPublishedAt } from '@views/owner-kindergarten-news-page/lib/formatOwnerKindergartenNewsPublishedAt';
import {
  deleteOwnerKindergartenNewsItem,
  getOwnerKindergartenNewsById,
  subscribeOwnerKindergartenNews,
} from '@views/owner-kindergarten-news-page/model/ownerKindergartenNewsStore';
import { OwnerKindergartenNewsDetailFooter } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsDetailFooter';
import { OwnerKindergartenNewsMoreMenu } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsMoreMenu';
import { useShare } from '@shared/lib/device';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';
import { Header } from '@widgets/Header';
function showOwnerKindergartenNewsShareSuccessToast() {
  const { shareSuccessToast } = ownerKindergartenNewsContent;

  toast({
    type: 'success',
    nativeTitle: shareSuccessToast.nativeTitle,
    titleParts: [
      { text: '유치원 ' },
      { text: '소식', accent: true },
      { text: '을 공유했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>유치원 </span>
        <span className='text-text-accent'>소식</span>
        <span className='text-text-primary-inverse'>을 공유했어요</span>
      </>
    ),
  });
}

/**
 * 원장 유치원 소식 상세
 * - 공유: OS 공유 시트 → 완료 시 accent 토스트
 * - 더보기: 수정/삭제 (목록과 동일)
 */
function OwnerKindergartenNewsDetailPage() {
  const params = useParams<{ id: string }>();
  const newsId = params?.id;
  const { back } = useStackNavigation();
  const share = useShare();
  const { pageTitle, detail } = ownerKindergartenNewsContent;

  const news = useSyncExternalStore(
    subscribeOwnerKindergartenNews,
    () => (newsId ? getOwnerKindergartenNewsById(newsId) : null),
    () => (newsId ? getOwnerKindergartenNewsById(newsId) : null)
  );

  const publishedAtLabel = useMemo(() => {
    if (!news) return '';
    return formatOwnerKindergartenNewsDetailPublishedAt(new Date(news.publishedAt));
  }, [news]);

  const handleShareClick = useCallback(async () => {
    if (!news) return;

    const shareUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `/owner/news/${news.id}`;

    const shared = await share({
      title: news.title,
      subject: news.title,
      message: news.title,
      url: shareUrl,
    });

    if (shared) showOwnerKindergartenNewsShareSuccessToast();
  }, [news, share]);

  const handleDelete = useCallback(
    async (id: string) => {
      deleteOwnerKindergartenNewsItem(id);
      await back();
    },
    [back]
  );

  if (!news) {
    return (
      <div data-testid='owner-kindergarten-news-detail-root' className='bg-bg-0 flex h-full flex-col'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
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
    <div data-testid='owner-kindergarten-news-detail-root' className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{pageTitle}</Header.Title>
        <Header.RightSection>
          <Header.ShareButton
            aria-label={detail.shareAriaLabel}
            onClick={() => {
              void handleShareClick();
            }}
          />
          <OwnerKindergartenNewsMoreMenu newsId={news.id} onDelete={handleDelete} />
        </Header.RightSection>
      </Header>

      <main className='flex min-h-0 flex-1 flex-col'>
        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-5'>
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <h1 className='h2-extrabold text-text-primary'>{news.title}</h1>
              <p className='label-semibold text-text-tertiary'>{publishedAtLabel}</p>
            </div>
            <p className='body1-regular text-text-primary whitespace-pre-wrap'>{news.body}</p>
          </div>
        </div>

        <div className='shrink-0 web:pb-0 webview:pb-(--safe-area-inset-bottom,0px)'>
          <OwnerKindergartenNewsDetailFooter
            readCount={news.readCount}
            guardianTotalCount={news.guardianTotalCount}
          />
        </div>
      </main>
    </div>
  );
}

export { OwnerKindergartenNewsDetailPage };

'use client';

import { useParams } from 'next/navigation';

import { Header } from '@widgets/Header';

import { formatPlatformDate, PlatformRichContent, usePlatformNoticeDetailQuery } from '@entities/platform-content';

function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = usePlatformNoticeDetailQuery(id);
  const notice = query.data;

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>공지사항</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto'>
        {query.isPending ? (
          <p className='body1-regular text-text-secondary px-4 py-8 text-center'>공지사항을 불러오고 있어요.</p>
        ) : query.isError ? (
          <p className='body1-regular text-text-secondary px-4 py-8 text-center'>공지사항을 불러오지 못했어요.</p>
        ) : notice ? (
          <article className='flex flex-col gap-5 px-4 py-5'>
            <div className='flex flex-col gap-2'>
              <h1 className='h2-extrabold text-text-primary'>{notice.title}</h1>
              <p className='body2-semibold text-text-secondary'>{formatPlatformDate(notice.publishedAt)}</p>
            </div>

            <PlatformRichContent value={notice.body} />
          </article>
        ) : (
          <p className='body1-regular text-text-secondary px-4 py-8 text-center'>공지사항을 찾을 수 없어요.</p>
        )}
      </main>
    </div>
  );
}

export { NoticeDetailPage };

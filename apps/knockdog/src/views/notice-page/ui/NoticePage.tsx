'use client';

import { useMemo } from 'react';
import { Header } from '@widgets/Header';

import { formatPlatformDate, usePlatformNoticesInfiniteQuery } from '@entities/platform-content';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';

function NoticePage() {
  const { push } = useStackNavigation();
  const query = usePlatformNoticesInfiniteQuery();
  const notices = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const fetchNextPage = query.fetchNextPage;

  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>공지사항</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto' aria-label='공지사항 목록'>
        {query.isPending ? (
          <p className='body1-regular text-text-secondary px-4 py-8 text-center'>공지사항을 불러오고 있어요.</p>
        ) : query.isError ? (
          <p className='body1-regular text-text-secondary px-4 py-8 text-center'>공지사항을 불러오지 못했어요.</p>
        ) : notices.length === 0 ? (
          <p className='body1-regular text-text-secondary px-4 py-8 text-center'>등록된 공지사항이 없어요.</p>
        ) : (
          <ul>
          {notices.map((notice) => (
            <li key={notice.id} className='border-line-200 bg-bg-0 border-b'>
              <button
                type='button'
                className='flex w-full flex-col gap-1 px-4 py-4 text-left'
                onClick={() => push({ pathname: route.mypage.notice.detail.root.replace('[id]', notice.id) })}
              >
                <span className='body1-bold text-text-primary line-clamp-2'>{notice.title}</span>
                <span className='body2-regular text-text-secondary'>{formatPlatformDate(notice.publishedAt)}</span>
              </button>
            </li>
          ))}
          </ul>
        )}
        <InfiniteScrollFooter
          hasNextPage={Boolean(query.hasNextPage)}
          isFetchingNextPage={query.isFetchingNextPage}
          sentinelRef={lastElementCallback}
        />
      </main>
    </div>
  );
}

export { NoticePage };

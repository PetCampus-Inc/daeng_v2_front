'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { noticePreviews } from '@views/notice-page/config/noticePreviews';
import { Header } from '@widgets/Header';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';

const NOTICE_PAGE_SIZE = 10;
const MOCK_PAGE_LOAD_DELAY = 250;

function NoticePage() {
  const { push } = useStackNavigation();
  const [visibleCount, setVisibleCount] = useState(NOTICE_PAGE_SIZE);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const isFetchingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const hasNextPage = visibleCount < noticePreviews.length;

  const fetchNextPage = useCallback(() => {
    if (isFetchingRef.current || visibleCount >= noticePreviews.length) return;

    isFetchingRef.current = true;
    setIsFetchingNextPage(true);
    timerRef.current = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + NOTICE_PAGE_SIZE, noticePreviews.length));
      isFetchingRef.current = false;
      setIsFetchingNextPage(false);
      timerRef.current = null;
    }, MOCK_PAGE_LOAD_DELAY);
  }, [visibleCount]);

  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>공지사항</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto' aria-label='공지사항 목록'>
        <ul>
          {noticePreviews.slice(0, visibleCount).map((notice) => (
            <li key={notice.id} className='border-line-200 bg-bg-0 border-b'>
              <button
                type='button'
                className='flex w-full flex-col gap-1 px-4 py-4 text-left'
                onClick={() => push({ pathname: route.mypage.notice.detail.root.replace('[id]', notice.id) })}
              >
                <span className='body1-bold text-text-primary line-clamp-2'>{notice.title}</span>
                <span className='body2-regular text-text-secondary'>{notice.date}</span>
              </button>
            </li>
          ))}
        </ul>
        <InfiniteScrollFooter
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={lastElementCallback}
        />
      </main>
    </div>
  );
}

export { NoticePage };

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ActionButton } from '@knockdog/ui';
import { InquiryListEmpty } from '@views/inquiry-list-page/ui/InquiryListEmpty';
import { InquiryListItem } from '@views/inquiry-list-page/ui/InquiryListItem';
import { Header } from '@widgets/Header';

import { useInquiriesInfiniteQuery, type InquiryListItemDto } from '@entities/inquiry';
import { useUserStore } from '@entities/user';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';
import { DelayedLoadingSpinner, InfiniteScrollFooter } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { COMMON_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';

/** 1:1 문의 내역 목록. 계정의 전체 문의를 최근 활동일시 순으로 보여주고 스크롤하면 이어서 불러온다 */
function InquiryListPage() {
  const { back, push } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const query = useInquiriesInfiniteQuery({ userId });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const isPending = !userId || query.isPending;
  // 이미 불러온 목록이 있으면 다음 페이지 조회가 실패해도 오류 화면으로 바꾸지 않는다 (실패는 토스트로 안내)
  const isInitialError = query.isError && !query.data;
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  // 다음 페이지 조회가 실패하면 하단 감지 영역이 화면에 남아 있어 곧바로 재요청이 반복된다.
  // 실패 후에는 자동 조회를 멈추고, 감지 영역이 화면 밖으로 나갔다가 다시 들어올 때만 다시 조회한다.
  // 목록 끝에서 계속 스크롤해도 재요청·오류 토스트가 반복되지 않는다
  const [isAutoFetchPaused, setIsAutoFetchPaused] = useState(false);
  const resumeObserverRef = useRef<IntersectionObserver | null>(null);

  // 렌더마다 새 함수를 넘기면 IntersectionObserver가 매번 다시 연결되므로 고정한다
  const handleFetchNextPage = useCallback(async () => {
    const result = await fetchNextPage();
    if (result.isFetchNextPageError) {
      setIsAutoFetchPaused(true);
      toast(COMMON_ERROR_TOAST_MESSAGE);
    }
  }, [fetchNextPage]);

  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage: hasNextPage && !isAutoFetchPaused,
    isFetchingNextPage,
    fetchNextPage: handleFetchNextPage,
  });

  /** 감지 영역을 다음 페이지 조회에 연결하고, 화면 밖으로 나가면 멈춘 자동 조회를 다시 켠다 */
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      lastElementCallback(node);
      resumeObserverRef.current?.disconnect();
      resumeObserverRef.current = null;
      if (!node) return;

      // 다음 페이지 조회와 같은 범위(useInfiniteScroll 기본 100px)를 벗어나야 나간 것으로 본다
      resumeObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry && !entry.isIntersecting) setIsAutoFetchPaused(false);
        },
        { rootMargin: '100px' }
      );
      resumeObserverRef.current.observe(node);
    },
    [lastElementCallback]
  );

  useEffect(() => () => resumeObserverRef.current?.disconnect(), []);

  const handleRetry = () => {
    query.refetch();
  };

  const handleItemClick = (item: InquiryListItemDto) => {
    push({ pathname: route.mypage.inquiry.detail.root.replace('[id]', String(item.id)) });
  };

  const handleWriteInquiry = () => {
    push({ pathname: route.mypage.inquiry.write.root });
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton
          onClick={() => {
            back();
          }}
        />
        <Header.Title>1:1 문의</Header.Title>
      </Header>

      {isInitialError ? (
        <PageError layout='inline' isRetrying={query.isFetching} onRetry={handleRetry} />
      ) : isPending ? (
        <DelayedLoadingSpinner isLoading={isPending} layout='content' />
      ) : (
        <>
          {items.length === 0 ? (
            <InquiryListEmpty />
          ) : (
            <div className='min-h-0 flex-1 overflow-y-auto'>
              <ul className='flex w-full flex-col'>
                {items.map((item) => (
                  <li key={item.id}>
                    <InquiryListItem item={item} onClick={handleItemClick} />
                  </li>
                ))}
              </ul>
              {hasNextPage ? (
                <InfiniteScrollFooter
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  sentinelRef={sentinelRef}
                />
              ) : null}
            </div>
          )}

          {/* 오류·로딩 중에는 콘텐츠 영역 전체를 교체하므로 목록·빈 상태에서만 노출 */}
          <div className='bg-bg-0 p-x4 shrink-0'>
            <ActionButton type='button' size='large' onClick={handleWriteInquiry}>
              문의하기
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
}

export { InquiryListPage };

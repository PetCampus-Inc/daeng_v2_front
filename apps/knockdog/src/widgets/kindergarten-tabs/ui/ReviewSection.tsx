'use client';

import { useState } from 'react';
import { ActionButton, Icon, SegmentedControl, SegmentedControlItem } from '@knockdog/ui';
import { useParams } from 'next/navigation';

import { ReviewCard } from '@features/review';
import { useReviewQuery } from '@features/review/api/useReviewQuery';
import type { ReviewListResponse } from '@entities/review';
import { useInfiniteScroll } from '@shared/lib';
import { useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner, LoadingSpinner } from '@shared/ui/loading-spinner';

type ReviewSource = 'knockdog' | 'blog';

function formatReviewCount(count: number) {
  return count.toLocaleString('ko-KR');
}

function getBlogReviewCount(pages: ReviewListResponse[] | undefined) {
  const paging = pages?.[0]?.paging;
  if (!paging) return null;
  if (typeof paging.totalCount === 'number') return paging.totalCount;
  if (!paging.hasNext) return pages?.reduce((count, page) => count + page.reviews.length, 0) ?? 0;
  return null;
}

function ReviewSourceLabel({ label, count }: { label: string; count: number | null }) {
  return (
    <span className='inline-flex items-center gap-1'>
      <span>{label}</span>
      {count != null ? <span>{formatReviewCount(count)}</span> : null}
    </span>
  );
}

function KnockdogReviewEmpty({ onWriteClick }: { onWriteClick: () => void }) {
  return (
    <div className='flex flex-col items-center gap-7 px-4'>
      <div className='mt-8 flex size-[200px] items-center justify-center'>
        <img src='/images/img_empty_knockdog_review.svg' alt='' />
      </div>
      <div className='flex flex-col items-center gap-1 text-center'>
        <p className='body1-bold text-text-primary'>유치원 이용 후기를 남겨 주세요!</p>
        <p className='body2-regular text-text-secondary'>리뷰가 다른 보호자에게 도움이 될 수 있어요.</p>
      </div>
      <ActionButton type='button' onClick={onWriteClick}>
        리뷰 작성하기
      </ActionButton>
    </div>
  );
}

const Header = () => (
  <div className='flex items-center gap-2'>
    <Icon icon='NaverFill' className='size-6' />
    <span className='body1-bold'>블로그 리뷰</span>
  </div>
);

const LoadingState = ({ isLoading }: { isLoading: boolean }) => (
  <DelayedLoadingSpinner isLoading={isLoading} layout='inline' className='py-8' />
);

const ErrorState = () => (
  <div className='flex justify-center py-8'>
    <span className='text-text-tertiary'>리뷰를 불러올 수 없습니다.</span>
  </div>
);

const EmptyState = () => (
  <div className='flex justify-center py-8'>
    <span className='text-text-tertiary'>아직 등록된 리뷰가 없습니다.</span>
  </div>
);

interface ReviewSectionProps {
  kindergartenId?: string;
  onScrollTop?: () => void;
}

export const ReviewSection = function ReviewSection({ kindergartenId, onScrollTop }: ReviewSectionProps) {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;

  if (!id) throw new Error('Company ID is required for review section');

  const { push } = useStackNavigation();
  const [source, setSource] = useState<ReviewSource>('blog');
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useReviewQuery(id);
  const { lastElementCallback } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const allReviews = data?.pages.flatMap((page) => page.reviews) ?? [];
  const blogReviewCount = getBlogReviewCount(data?.pages);

  const handleSourceChange = (value: string) => {
    if (value === 'knockdog' || value === 'blog') setSource(value);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingState isLoading={isLoading} />;
    if (isError) return <ErrorState />;
    if (allReviews.length === 0) return <EmptyState />;

    return (
      <div className='flex flex-col gap-5'>
        {allReviews.map((review, index) => (
          <div key={review.reviewIdx} ref={index === allReviews.length - 1 ? lastElementCallback : null}>
            <ReviewCard {...review} />
          </div>
        ))}

        {isFetchingNextPage ? (
          <div className='flex justify-center py-4'>
            <LoadingSpinner layout='inline' />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className='flex flex-col pb-12'>
      <div className='px-4 pt-5 pb-4'>
        <SegmentedControl value={source} onValueChange={handleSourceChange}>
          <SegmentedControlItem value='knockdog'>
            <ReviewSourceLabel label='똑독 리뷰' count={0} />
          </SegmentedControlItem>
          <SegmentedControlItem value='blog'>
            <ReviewSourceLabel label='블로그 리뷰' count={blogReviewCount} />
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      {source === 'knockdog' ? (
        <KnockdogReviewEmpty
          onWriteClick={() => push({ pathname: `/kindergarten/${id}/write-review` })}
        />
      ) : (
        <div className='flex flex-col gap-7 px-4'>
          <div className='flex flex-col gap-3'>
            <Header />
            {renderContent()}
          </div>

          {allReviews.length > 0 ? (
            <button
              type='button'
              onClick={onScrollTop}
              className='label-semibold text-text-tertiary flex h-[26px] items-center justify-center gap-1'
            >
              맨 위로 가기
              <Icon icon='ChevronTop' className='size-4' />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

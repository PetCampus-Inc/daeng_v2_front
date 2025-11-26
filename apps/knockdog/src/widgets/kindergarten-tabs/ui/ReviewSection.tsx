'use client';

import { Icon } from '@knockdog/ui';
import { useParams } from 'next/navigation';

import { ReviewCard } from '@features/review';
import { useReviewQuery } from '@features/review/api/useReviewQuery';
import { useInfiniteScroll } from '@shared/lib';

interface ReviewSectionProps {
  onScrollTop?: () => void;
}

const Header = () => (
  <div className='mb-3 flex'>
    <Icon icon='NaverFill' className='mr-2 h-[22px] w-[22px]' />
    <span className='body1-bold'>블로그 리뷰</span>
  </div>
);

const LoadingState = () => (
  <div className='flex justify-center py-8'>
    <span className='text-text-tertiary'>로딩 중...</span>
  </div>
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

export const ReviewSection = function ReviewSection({ onScrollTop }: ReviewSectionProps) {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for review section');

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useReviewQuery(id);
  const { lastElementCallback } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const allReviews = data?.pages.flatMap((page) => page.reviews) ?? [];

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    if (allReviews.length === 0) return <EmptyState />;

    return (
      <>
        {allReviews.map((review, index) => (
          <div key={review.reviewIdx} ref={index === allReviews.length - 1 ? lastElementCallback : null}>
            <ReviewCard {...review} />
          </div>
        ))}

        {isFetchingNextPage && (
          <div className='flex justify-center py-4'>
            <span className='text-text-tertiary text-sm'>더 많은 리뷰를 불러오는 중...</span>
          </div>
        )}

        {!hasNextPage && allReviews.length > 0 && (
          <div className='flex justify-center py-4'>
            <span className='text-text-tertiary text-sm'>모든 리뷰를 불러왔습니다.</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className='mt-10 mb-12 flex flex-col px-4'>
      <div className='mb-9'>
        <Header />
        {renderContent()}
      </div>

      {allReviews.length > 0 && (
        <button
          onClick={onScrollTop}
          className='text-text-tertiary label-semibold flex items-center justify-center gap-x-1'
        >
          맨 위로 가기 <Icon icon='ChevronTop' />
        </button>
      )}
    </div>
  );
};

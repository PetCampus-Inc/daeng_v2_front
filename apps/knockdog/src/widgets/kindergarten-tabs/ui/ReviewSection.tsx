'use client';

import { Icon } from '@knockdog/ui';
import { useParams } from 'next/navigation';

import { ReviewCard } from '@features/review';
import { useReviewQuery } from '@features/review/api/useReviewQuery';
import { useInfiniteScroll } from '@shared/lib';
import { DelayedLoadingSpinner, LoadingSpinner } from '@shared/ui/loading-spinner';

const Header = () => (
  <div className='mb-3 flex'>
    <Icon icon='NaverFill' className='mr-2 h-[22px] w-[22px]' />
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

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useReviewQuery(id);
  const { lastElementCallback } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const allReviews = data?.pages.flatMap((page) => page.reviews) ?? [];

  const renderContent = () => {
    if (isLoading) return <LoadingState isLoading={isLoading} />;
    if (isError) return <ErrorState />;
    if (allReviews.length === 0) return <EmptyState />;

    return (
      <>
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

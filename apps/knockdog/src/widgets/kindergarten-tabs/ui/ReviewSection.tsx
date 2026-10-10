'use client';

import { useRef, useState } from 'react';
import { ActionButton, Icon, SegmentedControl, SegmentedControlItem } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';

import {
  deleteKnockdogReview,
  getReviewTotalCount,
  KnockdogReviewDeleteDialogs,
  KnockdogReviewList,
  KnockdogReviewSortButton,
  ReviewCard,
  ReviewRatingSummary,
  sortKnockdogReviews,
  toggleKnockdogReviewHelpful,
  useKnockdogRatingCounts,
  useKnockdogReviews,
  type KnockdogReviewSort,
  type ReviewRatingCounts,
} from '@features/review';
import { useReviewQuery } from '@features/review/api/useReviewQuery';
import type { ReviewListResponse } from '@entities/review';
import { useInfiniteScroll } from '@shared/lib';
import { useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner, LoadingSpinner } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';

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

/** `?tab=후기&knockdogReview=1` 로 접속하면 리뷰가 있는 화면을 보여 준다. */
const EMPTY_KNOCKDOG_RATING_COUNTS: ReviewRatingCounts = {
  score5: 0,
  score4: 0,
  score3: 0,
  score2: 0,
  score1: 0,
};

function KnockdogReviewEmpty({ onWriteClick }: { onWriteClick: () => void }) {
  return (
    <div className='flex flex-col items-center gap-7 px-4'>
      <div className='mt-8 flex size-[200px] items-center justify-center'>
        {/* eslint-disable-next-line @next/next/no-img-element -- 빈 후기 일러스트 SVG */}
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

function KnockdogReviewHeader({
  counts,
  sort,
  onSortChange,
  onWriteClick,
}: {
  counts: ReviewRatingCounts;
  sort: KnockdogReviewSort;
  onSortChange: (sort: KnockdogReviewSort) => void;
  onWriteClick: () => void;
}) {
  const total = getReviewTotalCount(counts);

  return (
    <>
      <div className='flex flex-col gap-4 px-4 pb-4'>
        <ReviewRatingSummary counts={counts} />
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <p className='caption1-semibold text-text-primary'>유치원 이용 후기를 남겨 주세요!</p>
            <p className='caption1-regular text-text-secondary'>작성한 리뷰가 다른 보호자에게 도움이 될 수 있어요.</p>
          </div>
          <ActionButton type='button' size='small' className='shrink-0' onClick={onWriteClick}>
            리뷰 작성하기
          </ActionButton>
        </div>
      </div>
      <div className='flex items-center justify-between px-4 py-2'>
        <p className='label-medium text-fill-secondary-500'>총 {total.toLocaleString('ko-KR')}개 리뷰</p>
        <KnockdogReviewSortButton value={sort} onChange={onSortChange} />
      </div>
    </>
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
  const [knockdogReview] = useQueryState('knockdogReview');
  const id = kindergartenId ?? params?.id;

  if (!id) throw new Error('Company ID is required for review section');

  const { push } = useStackNavigation();
  const showKnockdogReviewMock = knockdogReview === '1';
  const [sourceOverride, setSourceOverride] = useState<ReviewSource | null>(null);
  const [knockdogReviewSort, setKnockdogReviewSort] = useState<KnockdogReviewSort>('latest');
  const [deleteDialog, setDeleteDialog] = useState<'confirm' | 'failure' | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);
  const knockdogReviews = useKnockdogReviews();
  const knockdogRatingCountsFromStore = useKnockdogRatingCounts();
  const source = sourceOverride ?? (showKnockdogReviewMock ? 'knockdog' : 'blog');
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useReviewQuery(id);
  const { lastElementCallback } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  const allReviews = data?.pages.flatMap((page) => page.reviews) ?? [];
  const blogReviewCount = getBlogReviewCount(data?.pages);
  const knockdogRatingCounts = showKnockdogReviewMock ? knockdogRatingCountsFromStore : EMPTY_KNOCKDOG_RATING_COUNTS;
  const knockdogReviewCount = getReviewTotalCount(knockdogRatingCounts);
  const handleWriteReview = () => push({ pathname: `/kindergarten/${id}/write-review` });
  const handleEditReview = (reviewId: string) => {
    push({ pathname: `/kindergarten/${id}/edit-review/${reviewId}` });
  };
  const sortedKnockdogReviews = sortKnockdogReviews(knockdogReviews, knockdogReviewSort);

  const handleHelpfulToggle = (reviewId: string) => {
    toggleKnockdogReviewHelpful(reviewId);
  };

  const handleDeleteReview = (reviewId: string) => {
    setDeleteTargetId(reviewId);
    setDeleteDialog('confirm');
  };

  const handleCloseDeleteDialog = () => {
    if (isDeletingRef.current) return;
    setDeleteDialog(null);
    setDeleteTargetId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId || isDeletingRef.current) return;

    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      await deleteKnockdogReview(deleteTargetId);
      setDeleteDialog(null);
      setDeleteTargetId(null);
      toast({
        title: '유치원 이용 리뷰를 삭제했어요',
        nativeTitle: '유치원 이용 리뷰를 삭제했어요',
        position: 'bottom',
      });
    } catch {
      setDeleteDialog('failure');
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  const handleSourceChange = (value: string) => {
    if (value === 'knockdog' || value === 'blog') setSourceOverride(value);
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
            <ReviewSourceLabel label='똑독 리뷰' count={knockdogReviewCount} />
          </SegmentedControlItem>
          <SegmentedControlItem value='blog'>
            <ReviewSourceLabel label='블로그 리뷰' count={blogReviewCount} />
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      {source === 'knockdog' ? (
        knockdogReviewCount === 0 ? (
          <KnockdogReviewEmpty onWriteClick={handleWriteReview} />
        ) : (
          <>
            <KnockdogReviewHeader
              counts={knockdogRatingCounts}
              sort={knockdogReviewSort}
              onSortChange={setKnockdogReviewSort}
              onWriteClick={handleWriteReview}
            />
            <KnockdogReviewList
              reviews={sortedKnockdogReviews}
              onHelpfulToggle={handleHelpfulToggle}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
            <KnockdogReviewDeleteDialogs
              dialog={deleteDialog}
              isSubmitting={isDeleting}
              onClose={handleCloseDeleteDialog}
              onConfirm={() => {
                handleConfirmDelete();
              }}
            />
          </>
        )
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

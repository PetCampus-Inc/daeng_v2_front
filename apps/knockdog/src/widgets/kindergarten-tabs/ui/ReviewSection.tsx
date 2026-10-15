'use client';

import { useRef, useState } from 'react';
import { ActionButton, Icon, SegmentedControl, SegmentedControlItem } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';

import {
  DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
  deleteKnockdogReview,
  getReviewTotalCount,
  hasKnockdogReviewReport,
  KnockdogReviewList,
  KnockdogReviewSortButton,
  ReviewActionDialog,
  ReviewCard,
  ReviewRatingSummary,
  sortKnockdogReviews,
  toggleKnockdogReviewHelpful,
  toReviewRatingCounts,
  useKnockdogRatingCounts,
  useKnockdogReviews,
  useSchoolReviewQuery,
  useSchoolReviewSummaryQuery,
  useDeleteSchoolReview,
  useSetSchoolReviewHelpful,
  type KnockdogReviewSort,
  type ReviewRatingCounts,
} from '@features/review';
import { useReviewQuery } from '@features/review/api/useReviewQuery';
import { parseSchoolId, type ReviewListResponse, type SchoolReviewSummary } from '@entities/review';
import { useUserStore } from '@entities/user';
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

/** `?tab=후기&knockdogReview=1` 이면 리뷰 목록과 작성 화면 플로우를 보여 준다. */
function KnockdogReviewEmpty({
  onWriteClick,
  writeLabel,
}: {
  onWriteClick: () => void;
  writeLabel: string | null;
}) {
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
      {writeLabel ? (
        <ActionButton type='button' onClick={onWriteClick}>
          {writeLabel}
        </ActionButton>
      ) : null}
    </div>
  );
}

function KnockdogReviewHeader({
  counts,
  summary,
  totalCount,
  sort,
  onSortChange,
  onWriteClick,
  writeLabel,
}: {
  counts: ReviewRatingCounts;
  summary?: SchoolReviewSummary | null;
  totalCount?: number;
  sort: KnockdogReviewSort;
  onSortChange: (sort: KnockdogReviewSort) => void;
  onWriteClick: () => void;
  writeLabel: string | null;
}) {
  const total = summary?.totalCount ?? totalCount ?? getReviewTotalCount(counts);

  return (
    <>
      <div className='flex flex-col gap-4 px-4 pb-4'>
        <ReviewRatingSummary counts={counts} summary={summary} />
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <p className='caption1-semibold text-text-primary'>유치원 이용 후기를 남겨 주세요!</p>
            <p className='caption1-regular text-text-secondary'>작성한 리뷰가 다른 보호자에게 도움이 될 수 있어요.</p>
          </div>
          {writeLabel ? (
            <ActionButton type='button' size='small' className='shrink-0' onClick={onWriteClick}>
              {writeLabel}
            </ActionButton>
          ) : null}
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
  schoolId?: number | string | null;
  onScrollTop?: () => void;
}

export const ReviewSection = function ReviewSection({ kindergartenId, schoolId, onScrollTop }: ReviewSectionProps) {
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
  const reporterId = useUserStore((state) => state.user?.userId) ?? '';
  const knockdogReviews = useKnockdogReviews();
  const knockdogRatingCountsFromStore = useKnockdogRatingCounts();
  const source = sourceOverride ?? (showKnockdogReviewMock ? 'knockdog' : 'blog');
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useReviewQuery(id);
  const { lastElementCallback } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const {
    data: schoolReviewData,
    isLoading: isSchoolReviewLoading,
    isError: isSchoolReviewError,
    hasNextPage: hasNextSchoolReviewPage,
    isFetchingNextPage: isFetchingNextSchoolReviewPage,
    fetchNextPage: fetchNextSchoolReviewPage,
  } = useSchoolReviewQuery(schoolId, knockdogReviewSort, !showKnockdogReviewMock);
  const { data: schoolReviewSummary, isLoading: isSchoolReviewSummaryLoading } = useSchoolReviewSummaryQuery(
    schoolId,
    !showKnockdogReviewMock
  );
  const { mutateAsync: removeSchoolReview } = useDeleteSchoolReview();
  const { mutate: setSchoolReviewHelpful } = useSetSchoolReviewHelpful();
  const { lastElementCallback: schoolReviewLastElementCallback } = useInfiniteScroll({
    hasNextPage: hasNextSchoolReviewPage,
    isFetchingNextPage: isFetchingNextSchoolReviewPage,
    fetchNextPage: fetchNextSchoolReviewPage,
  });

  const allReviews = data?.pages.flatMap((page) => page.reviews) ?? [];
  const blogReviewCount = getBlogReviewCount(data?.pages);
  const schoolReviews = schoolReviewData?.pages.flatMap((page) => page.items) ?? [];
  const schoolReviewTotal = schoolReviewData?.pages[0]?.totalCount ?? schoolReviews.length;
  const knockdogRatingCounts = showKnockdogReviewMock
    ? knockdogRatingCountsFromStore
    : toReviewRatingCounts(schoolReviews);
  const hasSchool = parseSchoolId(schoolId) != null;
  const summary = showKnockdogReviewMock ? null : schoolReviewSummary;
  const knockdogReviewCount = showKnockdogReviewMock
    ? getReviewTotalCount(knockdogRatingCountsFromStore)
    : !hasSchool
      ? 0
      : summary
        ? summary.totalCount
        : schoolReviewData
          ? schoolReviewTotal
          : null;
  const writeLabel = showKnockdogReviewMock
    ? '리뷰 작성하기'
    : isSchoolReviewSummaryLoading
      ? '리뷰 작성하기'
      : !summary || summary.canWrite
        ? '리뷰 작성하기'
        : summary.myReviewId != null
          ? '리뷰 수정하기'
          : null;
  const handleWriteReview = () => {
    if (!showKnockdogReviewMock && isSchoolReviewSummaryLoading) return;
    if (summary && !summary.canWrite) {
      if (summary.myReviewId == null) return;
      push({ pathname: `/kindergarten/${id}/edit-review/${summary.myReviewId}` });
      return;
    }
    push({ pathname: `/kindergarten/${id}/write-review` });
  };
  const handleEditReview = (reviewId: string) => {
    push({ pathname: `/kindergarten/${id}/edit-review/${reviewId}` });
  };
  const handleReportReview = (reviewId: string) => {
    const reportedByMe = schoolReviews.some((review) => review.id === reviewId && review.reportedByMe);
    if (reportedByMe || hasKnockdogReviewReport(reviewId, reporterId)) {
      toast({
        title: DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
        nativeTitle: DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
        position: 'bottom',
      });
      return;
    }

    push({ pathname: `/kindergarten/${id}/report-review`, query: { reviewId } });
  };
  const sortedKnockdogReviews = sortKnockdogReviews(knockdogReviews, knockdogReviewSort);

  const handleHelpfulToggle = (reviewId: string) => {
    if (showKnockdogReviewMock) {
      toggleKnockdogReviewHelpful(reviewId);
      return;
    }

    const review = schoolReviews.find((item) => item.id === reviewId);
    const parsedSchoolId = parseSchoolId(schoolId);
    const parsedReviewId = parseSchoolId(reviewId);
    if (!review || review.isMine || parsedSchoolId == null || parsedReviewId == null) return;

    setSchoolReviewHelpful(
      { schoolId: parsedSchoolId, reviewId: parsedReviewId, enabled: !review.isHelpful },
      {
        onError: () => {
          toast({
            title: '도움돼요를 반영하지 못했어요',
            nativeTitle: '도움돼요를 반영하지 못했어요',
            position: 'bottom',
          });
        },
      }
    );
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
      if (showKnockdogReviewMock) {
        await deleteKnockdogReview(deleteTargetId);
      } else {
        const parsedSchoolId = parseSchoolId(schoolId);
        const parsedReviewId = parseSchoolId(deleteTargetId);
        if (parsedSchoolId == null || parsedReviewId == null) throw new Error('review required');
        await removeSchoolReview({ schoolId: parsedSchoolId, reviewId: parsedReviewId });
      }
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

  const renderKnockdogContent = () => {
    if (!showKnockdogReviewMock && isSchoolReviewLoading && !schoolReviewData) return <LoadingState isLoading />;
    if (!showKnockdogReviewMock && isSchoolReviewError) return <ErrorState />;

    const reviews = showKnockdogReviewMock ? sortedKnockdogReviews : schoolReviews;
    if (reviews.length === 0) return <KnockdogReviewEmpty onWriteClick={handleWriteReview} writeLabel={writeLabel} />;

    return (
      <>
        <KnockdogReviewHeader
          counts={knockdogRatingCounts}
          summary={summary}
          totalCount={showKnockdogReviewMock ? undefined : schoolReviewTotal}
          sort={knockdogReviewSort}
          onSortChange={setKnockdogReviewSort}
          onWriteClick={handleWriteReview}
          writeLabel={writeLabel}
        />
        <KnockdogReviewList
          reviews={reviews}
          lastItemRef={showKnockdogReviewMock ? undefined : schoolReviewLastElementCallback}
          onHelpfulToggle={handleHelpfulToggle}
          onEdit={handleEditReview}
          onDelete={handleDeleteReview}
          onReport={handleReportReview}
        />
        {!showKnockdogReviewMock && isFetchingNextSchoolReviewPage ? (
          <div className='flex justify-center py-4'>
            <LoadingSpinner layout='inline' />
          </div>
        ) : null}
        <ReviewActionDialog
          isOpen={deleteDialog === 'confirm'}
          isSubmitting={isDeleting}
          title='해당 리뷰를 삭제할까요?'
          description='삭제한 리뷰는 복구할 수 없습니다.'
          hideDescription
          cancelLabel='닫기'
          confirmLabel='삭제'
          closeOnOutside
          onClose={handleCloseDeleteDialog}
          onConfirm={() => {
            handleConfirmDelete();
          }}
        />
        <ReviewActionDialog
          isOpen={deleteDialog === 'failure'}
          isSubmitting={isDeleting}
          title='리뷰를 삭제하지 못했어요'
          description='잠시 후 다시 시도해 주세요.'
          cancelLabel='닫기'
          confirmLabel='다시 시도'
          onClose={handleCloseDeleteDialog}
          onConfirm={() => {
            handleConfirmDelete();
          }}
        />
      </>
    );
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
        renderKnockdogContent()
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

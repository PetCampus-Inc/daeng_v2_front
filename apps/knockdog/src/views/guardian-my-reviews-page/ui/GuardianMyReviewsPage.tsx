'use client';

import { useMemo, useRef, useState } from 'react';
import { ActionButton } from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import {
  useReviewableKindergartens,
  useWritableKindergartens,
} from '@views/guardian-my-reviews-page/model/useWritableKindergartens';

import { Header } from '@widgets/Header';
import {
  MyWrittenReviewList,
  ReviewActionDialog,
  useDeleteSchoolReview,
  useMySchoolReviewQuery,
  type MyWrittenReview,
  type MyWrittenReviewSort,
} from '@features/review';
import { parseSchoolId } from '@entities/review';
import { useInfiniteScroll, useStackNavigation } from '@shared/lib';
import { DelayedLoadingSpinner, LoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { KindergartenSelectSheet } from '@shared/ui/kindergarten-select-sheet';
import { toast } from '@shared/ui/toast';

function GuardianMyReviewsPage() {
  const { back, push } = useStackNavigation();
  const { kindergartens: connectedKindergartens } = useWritableKindergartens();
  const { kindergartens, isLoading } = useReviewableKindergartens();
  const canWriteReview = !isLoading && kindergartens.length > 0;
  const [sort, setSort] = useState<MyWrittenReviewSort>('latest');
  const {
    data: myReviewData,
    isLoading: isMyReviewLoading,
    isError: isMyReviewError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useMySchoolReviewQuery(sort);
  const { lastElementCallback } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
  const { mutateAsync: removeSchoolReview } = useDeleteSchoolReview();
  const [deleteDialog, setDeleteDialog] = useState<'confirm' | 'failure' | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);
  const reviews = useMemo(
    () => myReviewData?.pages.flatMap((page) => page.items) ?? [],
    [myReviewData]
  );
  const reviewCount = myReviewData?.pages[0]?.totalCount ?? reviews.length;

  const handleWriteReview = () => {
    const handleSelectKindergarten = (kindergartenId: string) => {
      push({ pathname: `/kindergarten/${kindergartenId}/write-review` });
    };

    overlay.open(({ isOpen, close }) => (
      <KindergartenSelectSheet
        mode='write'
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={null}
        onSelect={handleSelectKindergarten}
      />
    ));
  };

  const handleEditReview = (review: MyWrittenReview) => {
    const placeId =
      review.placeId ||
      kindergartens.find((kindergarten) => parseSchoolId(kindergarten.schoolId) === review.schoolId)?.id ||
      connectedKindergartens.find((kindergarten) => parseSchoolId(kindergarten.schoolId) === review.schoolId)?.id;
    if (!placeId) {
      toast({
        title: '유치원 정보를 찾지 못했어요',
        nativeTitle: '유치원 정보를 찾지 못했어요',
        position: 'bottom',
      });
      return;
    }

    push({ pathname: `/kindergarten/${placeId}/edit-review/${review.id}` });
  };

  const handleDeleteReview = (review: MyWrittenReview) => {
    setDeleteTargetId(review.id);
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
      const target = reviews.find((review) => review.id === deleteTargetId);
      const schoolId = target?.schoolId ?? null;
      const reviewId = parseSchoolId(deleteTargetId);
      if (schoolId == null || reviewId == null) throw new Error('review required');
      await removeSchoolReview({ schoolId, reviewId });
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

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton
          onClick={() => {
            back();
          }}
        />
        <Header.Title>내 리뷰 관리</Header.Title>
      </Header>

      {isMyReviewLoading && !myReviewData ? (
        <DelayedLoadingSpinner isLoading layout='content' />
      ) : isMyReviewError && !myReviewData ? (
        <PageError
          onRetry={() => {
            refetch();
          }}
        />
      ) : reviews.length === 0 ? (
        <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-4'>
          <div className='flex w-full flex-col items-center gap-4 px-8'>
            <div className='flex h-[140px] w-[200px] shrink-0 items-center justify-center'>
              {/* eslint-disable-next-line @next/next/no-img-element -- 빈 리뷰 일러스트 SVG */}
              <img src='/images/img_empty_my_reviews.svg' alt='' width={182} height={89} />
            </div>
            <div className='flex w-full flex-col items-center gap-1 text-center'>
              <p className='body1-bold text-text-primary w-full'>작성한 유치원 이용 후기가 없어요</p>
              <p className='body2-regular text-text-secondary w-full'>유치원 이용 후기를 작성해 보세요.</p>
            </div>
            {canWriteReview ? (
              <ActionButton type='button' onClick={handleWriteReview}>
                리뷰 작성하기
              </ActionButton>
            ) : null}
          </div>
        </div>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto pb-6'>
          <MyWrittenReviewList
            reviews={reviews}
            totalCount={reviewCount}
            sort={sort}
            onSortChange={setSort}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
            lastItemRef={lastElementCallback}
          />
          {isFetchingNextPage ? (
            <div className='flex justify-center py-4'>
              <LoadingSpinner layout='inline' />
            </div>
          ) : null}
        </div>
      )}

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
    </div>
  );
}

export { GuardianMyReviewsPage };

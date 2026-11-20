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
  useDeleteSchoolReview,
  useMySchoolReviewQuery,
  type MyWrittenReview,
  type MyWrittenReviewSort,
} from '@features/review';
import { parseSchoolId } from '@entities/review';
import { useInfiniteScroll, useStackNavigation } from '@shared/lib';
import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { DelayedLoadingSpinner, LoadingSpinner } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { KindergartenSelectSheet } from '@shared/ui/kindergarten-select-sheet';
import { toast } from '@shared/ui/toast';

/** 삭제 확인창과 실패 안내창의 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const DELETE_CONFIRM_COPY = { title: '해당 리뷰를 삭제할까요?', cancelLabel: '닫기', confirmLabel: '삭제' };
const DELETE_FAILURE_COPY = {
  title: '리뷰를 삭제하지 못했어요',
  description: '잠시 후 다시 시도해 주세요.',
  cancelLabel: '닫기',
  confirmLabel: '다시 시도',
};

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

  /** 삭제 요청을 보낸다. 성공하면 토스트를 보여주고, 실패하면 실패 안내창을 연다. */
  const deleteReview = async (review: MyWrittenReview) => {
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;

    try {
      const schoolId = review.schoolId ?? null;
      const reviewId = parseSchoolId(review.id);
      if (schoolId == null || reviewId == null) throw new Error('review required');
      await removeSchoolReview({ schoolId, reviewId });
    } catch {
      isDeletingRef.current = false;
      await openDeleteDialog(review, 'failure');
      return;
    }

    isDeletingRef.current = false;
    toast({
      title: '유치원 이용 리뷰를 삭제했어요',
      nativeTitle: '유치원 이용 리뷰를 삭제했어요',
      position: 'bottom',
    });
  };

  /**
   * 삭제 확인창(또는 실패 안내창)을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다.
   * 앱·웹 모두 확인을 누르면 창이 바로 닫히고 삭제 요청이 시작된다.
   */
  const openDeleteDialog = async (review: MyWrittenReview, stage: 'confirm' | 'failure') => {
    const copy = stage === 'confirm' ? DELETE_CONFIRM_COPY : DELETE_FAILURE_COPY;
    const result = await openConfirmDialog(copy);
    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void deleteReview(review);
      return;
    }

    setDeleteTargetId(review.id);
    setDeleteDialog(stage);
  };

  const handleDeleteReview = (review: MyWrittenReview) => {
    openDeleteDialog(review, 'confirm');
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(null);
    setDeleteTargetId(null);
  };

  /** 웹 확인창에서 확인을 누르면 창을 바로 닫고 삭제 요청을 시작한다 */
  const handleConfirmDelete = () => {
    const target = reviews.find((review) => review.id === deleteTargetId);
    handleCloseDeleteDialog();
    if (target) void deleteReview(target);
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

      <ConfirmDialog
        isOpen={deleteDialog === 'confirm'}
        {...DELETE_CONFIRM_COPY}
        closeOnOutside
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
      <ConfirmDialog
        isOpen={deleteDialog === 'failure'}
        {...DELETE_FAILURE_COPY}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export { GuardianMyReviewsPage };

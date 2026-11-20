'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ActionButton, RadioGroup, RadioGroupItem } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { useKindergartenMainQuery } from '@features/kindergarten-main';
import {
  DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
  submitKnockdogReviewReport,
  useKnockdogReviews,
  useReportSchoolReview,
  useSchoolReviewDetailQuery,
} from '@features/review';
import { parseSchoolId, type SchoolReviewReportReason } from '@entities/review';
import { useBasePoint, useUserStore } from '@entities/user';
import { ApiError } from '@shared/api';
import { openConfirmDialog, useStackNavigation } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';
import { PageError } from '@shared/ui/page-error';
import { toast } from '@shared/ui/toast';
import { BottomCta } from '@shared/ui/bottom-cta';

const REPORT_REASONS = [
  '유치원과 관련 없는 내용이에요',
  '광고·홍보성 내용이에요',
  '개인정보가 포함되어 있어요',
  '욕설·비방·차별 표현이 있어요',
  '허위 내용 또는 악의적인 내용이에요',
  '저작권 등 권리 침해가 있어요',
  '같은 내용이 반복돼요',
  '기타',
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

const FALLBACK_COORD = { lng: 126.883439, lat: 37.511281 };
const ETC_REASON = '기타';
const MAX_DETAIL_LENGTH = 1000;
const REPORT_REASON_CODE = {
  '유치원과 관련 없는 내용이에요': 'UNRELATED',
  '광고·홍보성 내용이에요': 'ADVERTISEMENT',
  '개인정보가 포함되어 있어요': 'PERSONAL_INFORMATION',
  '욕설·비방·차별 표현이 있어요': 'ABUSIVE_OR_DISCRIMINATORY',
  '허위 내용 또는 악의적인 내용이에요': 'FALSE_OR_MALICIOUS',
  '저작권 등 권리 침해가 있어요': 'COPYRIGHT_INFRINGEMENT',
  '같은 내용이 반복돼요': 'REPETITIVE',
  기타: 'OTHER',
} as const satisfies Record<ReportReason, SchoolReviewReportReason>;

function isDuplicateReportError(error: unknown) {
  if (error instanceof ApiError) return error.status === 409 || String(error.code) === 'ALREADY_REPORTED';
  return error instanceof Error && error.message === 'ALREADY_REPORTED';
}
const DETAIL_PLACEHOLDER = '신고하는 상세 이유를 입력하세요. 신고 사유 중 기타 선택 시 필수로 입력해 주세요.';
const DETAIL_LIMIT_MESSAGE = '최대 1,000자까지 작성할 수 있어요.';
const REPORT_SUBMITTED_MESSAGE = '신고가 접수됐어요. 검토 후 조치할게요.';
/** 신고 실패 안내창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const REPORT_FAILURE_COPY = {
  title: '신고를 접수하지 못했어요',
  description: '잠시 후 다시 시도해 주세요.',
  cancelLabel: '닫기',
  confirmLabel: '다시 시도',
};

/** 제출 결과. skipped: 조건이 안 맞아 요청을 보내지 않음. done: 접수됐거나 이미 신고한 리뷰라 화면을 떠남 */
type SubmitOutcome = 'skipped' | 'done' | 'failed';

function formatReviewDate(createdAt: string) {
  const [datePart] = createdAt.split('T');
  const [year, month, day] = datePart?.split('-') ?? [];
  if (!year || !month || !day) return '';
  return `${year}. ${month}. ${day}`;
}

function ReviewReportPage() {
  const { id } = useParams<{ id: string }>();
  const { back } = useStackNavigation();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const parsedReviewId = parseSchoolId(reviewId);
  const isApiReview = parsedReviewId != null;
  const reporterId = useUserStore((state) => state.user?.userId) ?? '';
  const { coord } = useBasePoint();
  const {
    data: kindergarten,
    isPending: isKindergartenPending,
    isFetching: isKindergartenFetching,
    isError: isKindergartenError,
    refetch: refetchKindergarten,
  } = useKindergartenMainQuery({
    id,
    lng: coord?.lng ?? FALLBACK_COORD.lng,
    lat: coord?.lat ?? FALLBACK_COORD.lat,
    enabled: Boolean(id) && isApiReview,
  });
  const schoolId = parseSchoolId(kindergarten?.schoolId);
  const reviews = useKnockdogReviews();
  const localReview = !isApiReview && reviewId ? (reviews.find((item) => item.id === reviewId) ?? null) : null;
  const {
    data: apiReview,
    isLoading: isApiReviewLoading,
    isError: isApiReviewError,
    isFetching: isApiReviewFetching,
    refetch: refetchApiReview,
  } = useSchoolReviewDetailQuery(isApiReview ? schoolId : null, reviewId ?? undefined);
  const reportSchoolReview = useReportSchoolReview();
  const review = useMemo(() => {
    if (localReview) {
      return {
        id: localReview.id,
        score: localReview.score,
        createdAt: localReview.createdAt,
        content: localReview.content,
      };
    }
    if (!apiReview) return null;

    return {
      id: apiReview.id,
      score: apiReview.rating,
      createdAt: apiReview.createdAt,
      content: apiReview.content,
    };
  }, [apiReview, localReview]);
  const isResolvingReview =
    (isApiReview && schoolId == null && (isKindergartenPending || isKindergartenFetching)) ||
    (isApiReview && schoolId != null && isApiReviewLoading);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFailureOpen, setIsFailureOpen] = useState(false);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const isEtcReason = reason === ETC_REASON;
  const isDetailAtLimit = detail.length >= MAX_DETAIL_LENGTH;
  const canSubmit = reason !== '' && (!isEtcReason || detail.trim().length > 0) && !isSubmitting;

  const isReviewLoadError = isApiReview && (isKindergartenError || isApiReviewError);

  useEffect(() => {
    if (!id || !reviewId) {
      back();
      return;
    }
    if (isResolvingReview || review || isReviewLoadError) return;
    back();
  }, [back, id, isResolvingReview, isReviewLoadError, review, reviewId]);

  useLayoutEffect(() => {
    const element = detailRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, [detail]);

  const handleBack = () => {
    if (isSubmittingRef.current) return;
    back();
  };

  const handleCloseFailure = () => {
    setIsFailureOpen(false);
  };

  /** 신고 요청을 보낸다. 실패 안내는 호출한 쪽이 맡는다. */
  const submitReport = async (): Promise<SubmitOutcome> => {
    if (!review || reason === '' || isSubmittingRef.current) return 'skipped';
    if (isEtcReason && detail.trim().length === 0) return 'skipped';

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (localReview) {
        await submitKnockdogReviewReport({
          reviewId: review.id,
          score: review.score,
          createdAt: review.createdAt,
          content: review.content,
          reason,
          detail: detail.trim(),
          reporterId,
        });
      } else if (schoolId != null && parsedReviewId != null) {
        const trimmedDetail = detail.trim();
        await reportSchoolReview.mutateAsync({
          schoolId,
          reviewId: parsedReviewId,
          reason: REPORT_REASON_CODE[reason],
          ...(trimmedDetail ? { detail: trimmedDetail } : {}),
        });
      } else {
        throw new Error('school required');
      }

      toast({
        title: REPORT_SUBMITTED_MESSAGE,
        nativeTitle: REPORT_SUBMITTED_MESSAGE,
        position: 'bottom',
      });
      back();
      return 'done';
    } catch (error) {
      if (isDuplicateReportError(error)) {
        toast({
          title: DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
          nativeTitle: DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
          position: 'bottom',
        });
        back();
        return 'done';
      }

      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return 'failed';
    }
  };

  /**
   * 신고 실패 안내창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다.
   * `다시 시도`를 누르면 안내창이 바로 닫히고 신고 요청이 다시 시작된다. 또 실패하면 다시 안내한다.
   */
  const showFailure = async () => {
    const result = await openConfirmDialog(REPORT_FAILURE_COPY);
    if (result.status === 'pending') return;

    if (result.status === 'unavailable') {
      setIsFailureOpen(true);
      return;
    }

    if (result.action === 'confirm') await handleSubmit();
  };

  const handleSubmit = async () => {
    const outcome = await submitReport();
    if (outcome === 'failed') await showFailure();
  };

  if (!review) {
    if (!isReviewLoadError) return null;

    const handleRetryReviewLoad = () => {
      if (isKindergartenError) {
        refetchKindergarten().catch(() => undefined);
        return;
      }
      refetchApiReview().catch(() => undefined);
    };

    return (
      <div className='bg-bg-0 relative flex h-full min-h-0 flex-1 flex-col'>
        <Header>
          <Header.BackButton onClick={handleBack} />
          <Header.Title>리뷰 신고하기</Header.Title>
        </Header>
        <PageError
          layout='inline'
          isRetrying={isKindergartenFetching || isApiReviewFetching}
          onRetry={handleRetryReviewLoad}
        />
      </div>
    );
  }

  return (
    <div className='bg-bg-0 relative flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>리뷰 신고하기</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <section className='flex flex-col gap-3 p-4'>
          <p className='body2-bold text-text-primary'>신고할 리뷰</p>
          <div className='bg-bg-100 radius-r4 flex flex-col gap-2 p-4'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-0.5'>
                {/* eslint-disable-next-line @next/next/no-img-element -- 별점 아이콘 원본 색 유지 */}
                <img src='/images/img_review_card_star.svg' alt='' className='size-4' />
                <span className='body2-bold text-fill-secondary-700'>{review.score.toFixed(1)}</span>
              </span>
              <span className='body2-regular text-text-tertiary'>{formatReviewDate(review.createdAt)}</span>
            </div>
            <p className='body1-regular text-text-primary line-clamp-3 whitespace-pre-wrap'>{review.content}</p>
          </div>
        </section>

        <section className='flex flex-col gap-3 p-4'>
          <p className='body2-bold text-text-primary'>
            신고 사유를 선택해 주세요
            <span className='text-text-accent'> *</span>
          </p>
          <RadioGroup
            value={reason}
            disabled={isSubmitting}
            onValueChange={(value) => setReason(value as ReportReason)}
            className='gap-3'
          >
            {REPORT_REASONS.map((item, index) => {
              const itemId = `report-reason-${index}`;

              return (
                <label
                  key={item}
                  htmlFor={itemId}
                  className='border-line-200 radius-r2 flex cursor-pointer items-center gap-2 border px-4 py-[11px]'
                >
                  <div className='[&>div]:space-x-0'>
                    <RadioGroupItem value={item} id={itemId} />
                  </div>
                  <p className='body1-medium text-text-primary min-w-0 flex-1'>{item}</p>
                </label>
              );
            })}
          </RadioGroup>
        </section>

        <section className='flex flex-col gap-2 px-4 py-3'>
          <p className='body2-bold text-text-primary flex items-center gap-0.5'>
            상세 내용
            {isEtcReason ? (
              <span className='text-text-accent'> *</span>
            ) : (
              <span className='caption1-semibold text-text-tertiary'>(선택)</span>
            )}
          </p>
          <label className='bg-bg-50 radius-r2 flex flex-col gap-2 px-4 py-3'>
            <textarea
              ref={detailRef}
              value={detail}
              rows={3}
              maxLength={MAX_DETAIL_LENGTH}
              placeholder={DETAIL_PLACEHOLDER}
              className='body1-regular text-text-primary placeholder:text-text-tertiary min-h-[4.5rem] w-full resize-none overflow-hidden bg-transparent outline-none'
              disabled={isSubmitting}
              onChange={(event) => setDetail(event.target.value)}
            />
            <p className='body2-regular text-text-caption'>{detail.length.toLocaleString('ko-KR')}/1,000</p>
          </label>
          {isDetailAtLimit ? <p className='body2-regular text-error'>{DETAIL_LIMIT_MESSAGE}</p> : null}
        </section>
      </div>

      <BottomCta className='bg-bg-0 shrink-0 px-4 pt-4'>
        <ActionButton
          type='button'
          size='large'
          disabled={!canSubmit}
          onClick={() => {
            handleSubmit();
          }}
        >
          신고 접수
        </ActionButton>
      </BottomCta>
      <ActionLoadingOverlay isPending={isSubmitting && !isFailureOpen} />
      <ConfirmDialog
        isOpen={isFailureOpen}
        {...REPORT_FAILURE_COPY}
        onClose={handleCloseFailure}
        onConfirm={() => {
          setIsFailureOpen(false);
          handleSubmit();
        }}
      />
    </div>
  );
}

export { ReviewReportPage };

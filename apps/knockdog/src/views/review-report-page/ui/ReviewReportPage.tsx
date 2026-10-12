'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ActionButton, RadioGroup, RadioGroupItem } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import {
  DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
  submitKnockdogReviewReport,
  useKnockdogReviews,
} from '@features/review';
import { useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { ActionLoadingOverlay } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';

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

const ETC_REASON = '기타';
const MAX_DETAIL_LENGTH = 1000;
const DETAIL_PLACEHOLDER = '신고하는 상세 이유를 입력하세요. 신고 사유 중 기타 선택 시 필수로 입력해 주세요.';
const DETAIL_LIMIT_MESSAGE = '최대 1,000자까지 작성할 수 있어요.';
const REPORT_SUBMITTED_MESSAGE = '신고가 접수됐어요. 검토 후 조치할게요.';

type ReportReason = (typeof REPORT_REASONS)[number];

function formatReviewDate(createdAt: string) {
  const [datePart] = createdAt.split('T');
  const [year, month, day] = datePart?.split('-') ?? [];
  if (!year || !month || !day) return '';
  return `${year}. ${month}. ${day}`;
}

function ReviewReportPage() {
  const { back } = useStackNavigation();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId');
  const reporterId = useUserStore((state) => state.user?.userId) ?? '';
  const reviews = useKnockdogReviews();
  const review = reviews.find((item) => item.id === reviewId) ?? null;
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const isEtcReason = reason === ETC_REASON;
  const isDetailAtLimit = detail.length >= MAX_DETAIL_LENGTH;
  const canSubmit = reason !== '' && (!isEtcReason || detail.trim().length > 0) && !isSubmitting;

  useEffect(() => {
    if (review) return;
    back();
  }, [back, review]);

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

  const handleSubmit = async () => {
    if (!review || reason === '' || isSubmittingRef.current) return;
    if (isEtcReason && detail.trim().length === 0) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await submitKnockdogReviewReport({
        reviewId: review.id,
        score: review.score,
        createdAt: review.createdAt,
        content: review.content,
        reason,
        detail: detail.trim(),
        reporterId,
      });
      toast({
        title: REPORT_SUBMITTED_MESSAGE,
        nativeTitle: REPORT_SUBMITTED_MESSAGE,
        position: 'bottom',
      });
      back();
    } catch (error) {
      if (error instanceof Error && error.message === 'ALREADY_REPORTED') {
        toast({
          title: DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
          nativeTitle: DUPLICATE_KNOCKDOG_REVIEW_REPORT_MESSAGE,
          position: 'bottom',
        });
        back();
        return;
      }

      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (!review) return null;

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
            <p className='body1-regular text-text-primary line-clamp-3'>{review.content}</p>
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
          <label className='bg-bg-50 radius-r2 flex flex-col gap-8 px-4 py-3'>
            <textarea
              ref={detailRef}
              value={detail}
              rows={2}
              maxLength={MAX_DETAIL_LENGTH}
              placeholder={DETAIL_PLACEHOLDER}
              className='body1-regular text-text-primary placeholder:text-text-tertiary w-full resize-none overflow-hidden bg-transparent outline-none'
              disabled={isSubmitting}
              onChange={(event) => setDetail(event.target.value)}
            />
            <p className='body2-regular text-text-caption'>{detail.length.toLocaleString('ko-KR')}/1,000</p>
          </label>
          {isDetailAtLimit ? <p className='body2-regular text-error'>{DETAIL_LIMIT_MESSAGE}</p> : null}
        </section>
      </div>

      <div className='bg-bg-0 shrink-0 p-4'>
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
      </div>
      <ActionLoadingOverlay isPending={isSubmitting} />
    </div>
  );
}

export { ReviewReportPage };

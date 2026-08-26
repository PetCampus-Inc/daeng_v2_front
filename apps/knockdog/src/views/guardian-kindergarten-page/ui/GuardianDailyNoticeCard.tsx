'use client';

import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import type { GuardianCalendarDailyNotice } from '@entities/guardian-home';
import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';

interface GuardianDailyNoticeArrivedBannerProps {
  onViewClick?: () => void;
}

function GuardianDailyNoticeArrivedBanner({ onViewClick }: GuardianDailyNoticeArrivedBannerProps) {
  const content = guardianKindergartenAttendingContent;

  return (
    <div className='bg-fill-primary-50 radius-r3 flex w-full items-center justify-between gap-3 overflow-hidden p-4'>
      <div className='gap-x2 flex min-w-0 items-center'>
        <Image
          src={content.noticeArrivedIconSrc}
          alt={content.noticeArrivedIconAlt}
          width={32}
          height={32}
          className='size-8 shrink-0 object-contain'
        />
        <p className='body2-bold text-text-primary'>{content.noticeArrivedMessage}</p>
      </div>
      <button
        type='button'
        onClick={onViewClick}
        className='bg-fill-primary-500 caption2-semibold text-text-primary-inverse radius-r2 shrink-0 px-3 py-2'
      >
        {content.noticeViewLabel}
      </button>
    </div>
  );
}

interface GuardianDailyNoticeTimelineCardProps {
  notice: GuardianCalendarDailyNotice;
  timeLabel: string;
  showConnector?: boolean;
  onViewAllClick?: () => void;
}

/**
 * 본문 우선. 본문·컨디션·배변 상태 모두 없으면 간식 → 배변 메모 순으로 미리보기.
 */
function resolveNoticeTimelinePreview(notice: GuardianCalendarDailyNotice): string | null {
  const body = notice.body.trim();
  if (body) return body;

  if (notice.conditionLabel || notice.stoolLabel) return null;

  const snack = notice.snack.trim();
  if (snack) return snack;

  const poopMemo = notice.poopMemo.trim();
  if (poopMemo) return poopMemo;

  return null;
}

function GuardianDailyNoticeTimelineCard({
  notice,
  timeLabel,
  showConnector = false,
  onViewAllClick,
}: GuardianDailyNoticeTimelineCardProps) {
  const content = guardianKindergartenAttendingContent;
  const previewText = resolveNoticeTimelinePreview(notice);

  return (
    <div className='flex w-full items-start gap-3'>
      <div className='flex w-14 shrink-0 flex-col items-center gap-1 self-stretch'>
        <p className='caption1-regular text-text-secondary whitespace-nowrap'>{timeLabel}</p>
        {showConnector ? <div className='bg-line-200 w-px flex-1' /> : null}
      </div>
      <div className='bg-bg-50 radius-r2 flex min-w-0 flex-1 flex-col items-end gap-4 p-4'>
        <div className='gap-x2 flex w-full flex-col items-start gap-2'>
          {notice.conditionLabel || notice.stoolLabel ? (
            <div className='gap-x2 flex flex-wrap items-center'>
              {notice.conditionLabel ? (
                <span className='border-line-200 gap-x1 bg-bg-0 caption1-semibold flex items-center rounded-full border px-2 py-1.5'>
                  <span className='text-text-secondary'>{content.noticeConditionLabel}</span>
                  <span className='caption1-extrabold text-text-accent'>{notice.conditionLabel}</span>
                </span>
              ) : null}
              {notice.stoolLabel ? (
                <span className='border-line-200 gap-x1 bg-bg-0 caption1-semibold flex items-center rounded-full border px-2 py-1.5'>
                  <span className='text-text-secondary'>{content.noticeStoolLabel}</span>
                  <span className='caption1-extrabold text-text-accent'>{notice.stoolLabel}</span>
                </span>
              ) : null}
            </div>
          ) : null}
          {previewText ? (
            <p className='body2-regular text-text-primary line-clamp-2 w-full'>{previewText}</p>
          ) : null}
        </div>
        <button
          type='button'
          className='gap-x1 flex items-center justify-center rounded px-2 py-1'
          onClick={onViewAllClick}
        >
          <span className='caption1-semibold text-text-tertiary'>{content.noticeViewAllLabel}</span>
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
        </button>
      </div>
    </div>
  );
}

export { GuardianDailyNoticeArrivedBanner, GuardianDailyNoticeTimelineCard };

'use client';

import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import type { GuardianDailyNoticeMock } from '@views/guardian-kindergarten-page/config/guardianAttendanceMock';

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
  notice: GuardianDailyNoticeMock;
  timeLabel: string;
}

function GuardianDailyNoticeTimelineCard({ notice, timeLabel }: GuardianDailyNoticeTimelineCardProps) {
  const content = guardianKindergartenAttendingContent;

  return (
    <div className='flex w-full items-start gap-4'>
      <p className='caption1-regular text-text-secondary w-12 shrink-0'>{timeLabel}</p>
      <div className='bg-bg-50 radius-r2 flex min-w-0 flex-1 flex-col items-end gap-4 p-4'>
        <div className='gap-x2 flex w-full flex-col items-start gap-2'>
          <div className='gap-x2 flex flex-wrap items-center'>
            <span className='border-line-200 gap-x1 bg-bg-0 caption1-semibold flex items-center rounded-full border px-2 py-1.5'>
              <span className='text-text-secondary'>{content.noticeConditionLabel}</span>
              <span className='caption1-extrabold text-text-accent'>{notice.conditionLabel}</span>
            </span>
            <span className='border-line-200 gap-x1 bg-bg-0 caption1-semibold flex items-center rounded-full border px-2 py-1.5'>
              <span className='text-text-secondary'>{content.noticeStoolLabel}</span>
              <span className='caption1-extrabold text-text-accent'>{notice.stoolLabel}</span>
            </span>
          </div>
          <p className='body2-regular text-text-primary line-clamp-2 w-full'>{notice.body}</p>
        </div>
        <button type='button' className='gap-x1 flex items-center justify-center rounded px-2 py-1'>
          <span className='caption1-semibold text-text-tertiary'>{content.noticeViewAllLabel}</span>
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
        </button>
      </div>
    </div>
  );
}

export { GuardianDailyNoticeArrivedBanner, GuardianDailyNoticeTimelineCard };

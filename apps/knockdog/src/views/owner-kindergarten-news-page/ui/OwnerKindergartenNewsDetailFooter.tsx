'use client';

import { Icon } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';

interface OwnerKindergartenNewsDetailFooterProps {
  readCount: number;
  guardianTotalCount: number;
  onSendNotification?: () => void;
}

function OwnerKindergartenNewsDetailFooter({
  readCount,
  guardianTotalCount,
  onSendNotification,
}: OwnerKindergartenNewsDetailFooterProps) {
  const { detail } = ownerKindergartenNewsContent;

  return (
    <div className='bg-bg-0 shadow-[0px_1px_4px_rgba(12,12,13,0.1),0px_1px_4px_rgba(12,12,13,0.05)] flex w-full items-center gap-1 rounded-t-xl px-4 py-3'>
      <div className='flex min-w-0 flex-1 items-center gap-1'>
        <Icon icon='CheckFill' className='text-text-accent size-7 shrink-0' aria-hidden />
        <p className='body1-bold text-text-primary truncate'>
          {detail.readStatusPrefix} {guardianTotalCount}
          {detail.readStatusMiddle}{' '}
          <span className='text-text-accent'>{readCount}</span>
          {detail.readStatusSuffix}
        </p>
      </div>
      <button
        type='button'
        className='body1-regular text-text-primary shrink-0 underline underline-offset-2'
        onClick={onSendNotification}
      >
        {detail.sendNotificationLabel}
      </button>
    </div>
  );
}

export { OwnerKindergartenNewsDetailFooter };

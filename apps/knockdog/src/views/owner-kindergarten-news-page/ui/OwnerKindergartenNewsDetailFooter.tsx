'use client';

import { Icon } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';

interface OwnerKindergartenNewsDetailFooterProps {
  readCount: number;
  guardianTotalCount: number;
  onOpenReadReaction?: () => void;
}

function OwnerKindergartenNewsDetailFooter({
  readCount,
  guardianTotalCount,
  onOpenReadReaction,
}: OwnerKindergartenNewsDetailFooterProps) {
  const { detail } = ownerKindergartenNewsContent;
  const showReadSummary = readCount > 0;

  return (
    <div className='bg-bg-0 shadow-[0px_1px_4px_rgba(12,12,13,0.1),0px_1px_4px_rgba(12,12,13,0.05)] flex w-full items-center gap-1 rounded-t-xl px-4 py-3'>
      {showReadSummary ? (
        <button
          type='button'
          className='flex min-w-0 flex-1 items-center gap-1 text-left'
          onClick={onOpenReadReaction}
        >
          <Icon icon='CheckFill' className='text-text-accent size-7 shrink-0' aria-hidden />
          <p className='body1-bold text-text-primary truncate'>
            {detail.readStatusPrefix} {guardianTotalCount}
            {detail.readStatusMiddle}{' '}
            <span className='text-text-accent'>{readCount}</span>
            {detail.readStatusSuffix}
          </p>
        </button>
      ) : (
        <div className='min-w-0 flex-1' />
      )}
      <button
        type='button'
        className='body1-regular text-text-primary shrink-0 underline underline-offset-2'
        onClick={onOpenReadReaction}
      >
        {detail.sendNotificationLabel}
      </button>
    </div>
  );
}

export { OwnerKindergartenNewsDetailFooter };

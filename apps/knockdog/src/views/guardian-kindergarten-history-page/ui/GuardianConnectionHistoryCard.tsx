'use client';

import { cn } from '@knockdog/ui/lib';

import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';
import { formatKoreanHistoryDate } from '@views/guardian-kindergarten-history-page/lib/formatGuardianConnectionHistory';
import type { GuardianConnectionHistoryItem } from '@views/guardian-kindergarten-history-page/model/guardianConnectionHistory';

interface GuardianConnectionHistoryCardProps {
  item: GuardianConnectionHistoryItem;
}

function GuardianConnectionHistoryCard({ item }: GuardianConnectionHistoryCardProps) {
  const content = guardianConnectionHistoryContent;
  const isCurrent = item.disconnectedAt == null;
  const connectedLabel = formatKoreanHistoryDate(item.connectedAt);
  const disconnectedLabel = item.disconnectedAt
    ? formatKoreanHistoryDate(item.disconnectedAt)
    : content.currentLabel;
  const badgeLabel = `${content.attendanceBadgePrefix} ${item.attendanceDayCount}${content.attendanceBadgeSuffix}`;

  return (
    <div
      className={cn(
        'radius-r3 flex w-full flex-col gap-4 p-4',
        isCurrent ? 'bg-bg-0 border-line-200 border' : 'bg-bg-50'
      )}
    >
      <div className='flex w-full items-start gap-2'>
        <div className='gap-x2 flex min-w-0 flex-1 items-start'>
          <div className='relative size-11 shrink-0 overflow-hidden rounded-lg'>
            {/* eslint-disable-next-line @next/next/no-img-element -- 썸네일은 절대 URL 또는 S3 키 */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className='size-full object-cover'
              loading='lazy'
              decoding='async'
              referrerPolicy='no-referrer'
            />
          </div>
          <div className='flex min-w-0 flex-1 flex-col items-start'>
            <p className='body1-bold text-text-primary w-full truncate'>{item.name}</p>
            <p className='body2-regular text-text-secondary w-full truncate'>{item.address}</p>
          </div>
        </div>

        <span
          className={cn(
            'caption1-semibold shrink-0 rounded-full border px-2 py-1',
            isCurrent
              ? 'border-line-accent text-text-accent'
              : 'border-line-200 text-text-secondary'
          )}
        >
          {badgeLabel}
        </span>
      </div>

      <div
        className={cn(
          'radius-r2 flex w-full items-center justify-center gap-1 overflow-hidden px-4 py-2',
          isCurrent ? 'bg-fill-primary-50' : 'bg-bg-100'
        )}
      >
        {isCurrent ? (
          <>
            <span className='body2-semibold text-text-primary'>{connectedLabel}</span>
            <span className='body2-semibold text-text-primary'>~</span>
            <span className='body2-bold text-text-accent'>{disconnectedLabel}</span>
          </>
        ) : (
          <span className='body2-semibold text-text-secondary'>
            {connectedLabel} ~ {disconnectedLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export { GuardianConnectionHistoryCard };

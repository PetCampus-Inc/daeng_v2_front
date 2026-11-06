import { cn } from '@knockdog/ui/lib';

import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { formatKoreanHistoryDate } from '@views/owner/member-profile/lib/formatOwnerMemberConnectionHistory';
import type { OwnerMemberConnectionHistoryItem } from '@views/owner/member-profile/model/ownerMemberConnectionHistory';

interface OwnerMemberConnectionHistoryCardProps {
  item: OwnerMemberConnectionHistoryItem;
}

/** 조회 전용으로 별도 카드 동작 없음 */
function OwnerMemberConnectionHistoryCard({ item }: OwnerMemberConnectionHistoryCardProps) {
  const content = ownerMemberProfileContent;
  const isCurrent = item.disconnectedAt == null;
  const connectedLabel = formatKoreanHistoryDate(item.connectedAt);
  const disconnectedLabel = item.disconnectedAt
    ? formatKoreanHistoryDate(item.disconnectedAt)
    : content.currentLabel;
  const badgeLabel = `${content.attendanceBadgePrefix} ${item.attendanceDayCount}${content.attendanceBadgeSuffix}`;

  return (
    <div
      className={cn(
        'radius-r3 flex w-full items-center gap-2 p-4',
        isCurrent ? 'bg-bg-0' : 'bg-bg-100'
      )}
    >
      {isCurrent ? (
        <div className='flex min-w-0 flex-1 items-center gap-1 overflow-hidden'>
          <span className='body2-semibold text-text-primary shrink-0'>{connectedLabel}</span>
          <span className='body2-semibold text-text-primary shrink-0'>~</span>
          <span className='body2-bold text-text-accent shrink-0'>{disconnectedLabel}</span>
        </div>
      ) : (
        <p className='body2-semibold text-text-secondary min-w-0 flex-1 truncate'>
          {connectedLabel} ~ {disconnectedLabel}
        </p>
      )}

      <span
        className={cn(
          'caption1-semibold bg-bg-0 shrink-0 rounded-full border px-2 py-1',
          isCurrent
            ? 'border-line-accent text-text-accent'
            : 'border-line-200 text-text-secondary'
        )}
      >
        {badgeLabel}
      </span>
    </div>
  );
}

export { OwnerMemberConnectionHistoryCard };

import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

import { TicketLifecycleBadge } from '../ticket-lifecycle-badge';

type TicketSummaryStatus = 'active' | 'scheduled' | 'onHold' | 'expired';

interface TicketSummaryCardProps extends Omit<ComponentProps<'article'>, 'title'> {
  title: ReactNode;
  status?: TicketSummaryStatus;
  remainingCount: ReactNode;
  totalCount: ReactNode;
  period: ReactNode;
  remainingDays?: ReactNode;
  highlightRemaining?: boolean;
}

/** V4 / Card / Ticket Summary */
function TicketSummaryCard({
  title,
  status = 'active',
  remainingCount,
  totalCount,
  period,
  remainingDays,
  highlightRemaining = true,
  className,
  ...props
}: TicketSummaryCardProps) {
  const isExpired = status === 'expired';

  return (
    <article
      className={cn(
        'radius-r4 flex w-full flex-col gap-x1_5 overflow-hidden py-x4 pr-x3 pl-x4',
        isExpired ? 'bg-bg-100' : 'bg-bg-0',
        className
      )}
      {...props}
    >
      <div className='flex w-full items-center justify-between'>
        <p className='body1-bold text-text-primary min-w-0 flex-1 truncate'>{title}</p>
        <TicketLifecycleBadge status={status} />
      </div>
      <p className='body2-semibold text-text-secondary'>
        잔여{' '}
        <span className={status === 'active' && highlightRemaining ? 'text-text-accent' : undefined}>
          {remainingCount}회
        </span>
        {` / ${totalCount}회`}
      </p>
      <div className='flex items-center gap-x1_5'>
        <p className='body2-regular text-text-secondary'>{period}</p>
        {!isExpired && remainingDays != null ? (
          <p className='body2-bold text-fill-secondary-500'>· {remainingDays}일 남음</p>
        ) : null}
      </div>
    </article>
  );
}

export { TicketSummaryCard };
export type { TicketSummaryCardProps, TicketSummaryStatus };

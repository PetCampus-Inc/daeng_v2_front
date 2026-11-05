import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const TICKET_STATUS_BADGE_LABEL = {
  remaining: '1회 남음',
  dday: 'D-3',
  expired: '만료',
} as const;

type TicketStatusBadgeStatus = keyof typeof TICKET_STATUS_BADGE_LABEL;

interface TicketStatusBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  status?: TicketStatusBadgeStatus;
  children?: ReactNode;
}

/** V4 / Badge / Ticket Status */
function TicketStatusBadge({ status = 'remaining', className, children, ...props }: TicketStatusBadgeProps) {
  return (
    <span
      className={cn(
        'caption1-semibold bg-fill-primary-50 text-text-accent radius-r3 pt-x1_5 pb-x1 px-x2 inline-flex h-[26px] items-center justify-center',
        className
      )}
      {...props}
    >
      {children ?? TICKET_STATUS_BADGE_LABEL[status]}
    </span>
  );
}

export { TicketStatusBadge };
export type { TicketStatusBadgeProps, TicketStatusBadgeStatus };

import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const ticketLifecycleBadgeVariants = cva(
  'caption1-semibold radius-full px-x2 py-x1 inline-flex items-center justify-center border border-solid',
  {
    variants: {
      status: {
        active: 'bg-bg-0 border-line-accent text-text-accent',
        scheduled: 'bg-bg-0 border-line-200 text-fill-secondary-500',
        onHold: 'bg-bg-0 border-line-200 text-fill-secondary-500',
        expired: 'bg-bg-100 border-line-200 text-fill-secondary-500',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
);

const TICKET_LIFECYCLE_BADGE_LABEL = {
  active: '사용중',
  scheduled: '사용예정',
  onHold: '홀딩중',
  expired: '만료',
} as const;

type TicketLifecycleBadgeStatus = keyof typeof TICKET_LIFECYCLE_BADGE_LABEL;

interface TicketLifecycleBadgeProps
  extends Omit<ComponentProps<'span'>, 'children'>,
    VariantProps<typeof ticketLifecycleBadgeVariants> {
  status?: TicketLifecycleBadgeStatus;
  children?: ReactNode;
}

/** V4 / Badge / Ticket Lifecycle */
function TicketLifecycleBadge({ status = 'active', className, children, ...props }: TicketLifecycleBadgeProps) {
  return (
    <span className={cn(ticketLifecycleBadgeVariants({ status }), className)} {...props}>
      {children ?? TICKET_LIFECYCLE_BADGE_LABEL[status]}
    </span>
  );
}

export { TicketLifecycleBadge, ticketLifecycleBadgeVariants };
export type { TicketLifecycleBadgeProps, TicketLifecycleBadgeStatus };

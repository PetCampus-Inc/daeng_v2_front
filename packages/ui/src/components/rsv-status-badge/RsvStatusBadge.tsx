import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const rsvStatusBadgeVariants = cva(
  'caption1-semibold radius-full inline-flex items-center justify-center px-x2 py-x1',
  {
    variants: {
      status: {
        confirmed: 'border-line-accent bg-fill-secondary-0 text-text-accent border border-solid',
        attended: 'border-line-200 bg-fill-secondary-0 text-text-secondary border border-solid',
        absence: 'bg-fill-secondary-100 text-fill-secondary-500',
      },
    },
    defaultVariants: {
      status: 'confirmed',
    },
  }
);

const RSV_STATUS_LABEL = {
  confirmed: '예약 확정',
  attended: '등원 완료',
  absence: '결석',
} as const;

type RsvStatus = keyof typeof RSV_STATUS_LABEL;

interface RsvStatusBadgeProps extends Omit<ComponentProps<'span'>, 'children'>, VariantProps<typeof rsvStatusBadgeVariants> {
  status?: RsvStatus;
  children?: ReactNode;
}

/** V4 / Badge / Reservation Status */
function RsvStatusBadge({ status = 'confirmed', className, children, ...props }: RsvStatusBadgeProps) {
  return (
    <span className={cn(rsvStatusBadgeVariants({ status }), className)} {...props}>
      {children ?? RSV_STATUS_LABEL[status]}
    </span>
  );
}

export { RsvStatusBadge, rsvStatusBadgeVariants };
export type { RsvStatus, RsvStatusBadgeProps };

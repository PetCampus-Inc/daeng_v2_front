import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const membershipCardStatusBadgeVariants = cva('radius-full inline-flex h-x6 items-center justify-center px-x2_5 py-x0_5', {
  variants: {
    status: {
      soon: 'caption1-extrabold bg-fill-primary-50 text-text-accent',
      active: 'caption1-semibold border-line-accent bg-bg-0 text-text-accent border border-solid',
      scheduled: 'caption1-semibold bg-fill-secondary-100 text-text-secondary',
      onHold: 'caption1-semibold bg-fill-secondary-100 text-text-secondary',
      expired:
        'caption1-semibold text-text-secondary bg-[linear-gradient(rgba(0,0,0,0.07),rgba(0,0,0,0.07)),linear-gradient(var(--color-fill-secondary-100),var(--color-fill-secondary-100))]',
    },
  },
  defaultVariants: {
    status: 'soon',
  },
});

const MEMBERSHIP_CARD_STATUS_LABEL = {
  soon: 'D-3',
  active: '사용 중',
  scheduled: '사용 예정',
  onHold: '홀딩 중',
  expired: '만료',
} as const;

type MembershipCardStatus = keyof typeof MEMBERSHIP_CARD_STATUS_LABEL;

interface MembershipCardStatusBadgeProps
  extends Omit<ComponentProps<'span'>, 'children'>,
    VariantProps<typeof membershipCardStatusBadgeVariants> {
  status?: MembershipCardStatus;
  children?: ReactNode;
}

/** V4 / Badge / Membership Card Status */
function MembershipCardStatusBadge({ status = 'soon', className, children, ...props }: MembershipCardStatusBadgeProps) {
  return (
    <span className={cn(membershipCardStatusBadgeVariants({ status }), className)} {...props}>
      {children ?? MEMBERSHIP_CARD_STATUS_LABEL[status]}
    </span>
  );
}

export { MembershipCardStatusBadge, membershipCardStatusBadgeVariants };
export type { MembershipCardStatus, MembershipCardStatusBadgeProps };

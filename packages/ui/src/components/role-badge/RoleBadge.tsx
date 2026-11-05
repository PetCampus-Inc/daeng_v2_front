import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const ROLE_BADGE_LABEL = {
  director: '원장',
  staff: '직원',
  admin: '관리자',
} as const;

type RoleBadgeRole = keyof typeof ROLE_BADGE_LABEL;

interface RoleBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  role?: RoleBadgeRole;
  children?: ReactNode;
}

/** V4 / Badge / Role */
function RoleBadge({ role = 'director', className, children, ...props }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'caption1-semibold bg-fill-secondary-100 text-text-secondary radius-r3 pt-x1_5 pb-x1 px-x2 inline-flex items-center justify-center',
        className
      )}
      {...props}
    >
      {children ?? ROLE_BADGE_LABEL[role]}
    </span>
  );
}

export { RoleBadge };
export type { RoleBadgeProps, RoleBadgeRole };

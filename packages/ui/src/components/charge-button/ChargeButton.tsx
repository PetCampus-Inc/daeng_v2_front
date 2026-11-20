import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface ChargeButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  children?: ReactNode;
}

/** V4 / Navigation / Charge Text Action */
function ChargeButton({ children = '충전하기', className, type = 'button', ...props }: ChargeButtonProps) {
  return (
    <button type={type} className={cn('body1-bold text-text-accent inline-flex h-x6 items-center', className)} {...props}>
      {children}
    </button>
  );
}

export { ChargeButton };
export type { ChargeButtonProps };

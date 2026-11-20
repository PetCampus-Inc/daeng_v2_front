import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface TodayButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  children?: ReactNode;
}

/** V4 / Button / 오늘로 이동 */
function TodayButton({ children = '오늘', className, type = 'button', ...props }: TodayButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'caption1-regular text-text-secondary border-text-caption inline-flex h-[28px] items-center justify-center rounded-[14px] border border-solid px-x3',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { TodayButton };
export type { TodayButtonProps };

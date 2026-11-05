import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface DurationChipProps extends Omit<ComponentProps<'button'>, 'children'> {
  selected?: boolean;
  children?: ReactNode;
}

/** V4 / Selection / Duration Chip */
function DurationChip({ selected = false, children = '만료 없음', className, type = 'button', ...props }: DurationChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'radius-full inline-flex h-[37px] items-center border-solid px-x3_5 py-x2',
        selected
          ? 'body2-semibold text-text-accent bg-fill-primary-50 border-line-accent border-[1.5px]'
          : 'body2-regular text-fill-secondary-500 bg-bg-0 border-fill-secondary-300 border',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { DurationChip };
export type { DurationChipProps };

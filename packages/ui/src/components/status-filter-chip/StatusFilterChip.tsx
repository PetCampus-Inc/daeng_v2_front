import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface StatusFilterChipProps extends Omit<ComponentProps<'button'>, 'children'> {
  selected?: boolean;
  children?: ReactNode;
}

/** V4 / Selection / Status Filter Chip */
function StatusFilterChip({ selected = false, children = '전체 22', className, type = 'button', ...props }: StatusFilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'label-medium radius-full inline-flex items-center border-[1.4px] border-solid px-x3 py-x2',
        selected
          ? 'bg-fill-secondary-700 text-text-primary-inverse border-line-200'
          : 'bg-bg-0 text-text-secondary border-line-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { StatusFilterChip };
export type { StatusFilterChipProps };

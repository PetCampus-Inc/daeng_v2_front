import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface CustomDurationChipProps extends Omit<ComponentProps<'button'>, 'children'> {
  selected?: boolean;
  children?: ReactNode;
}

function PlusIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M2.91667 7H11.0833' stroke='currentColor' strokeWidth='1.02083' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M7 2.91667V11.0833' stroke='currentColor' strokeWidth='1.02083' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

/** V4 / Selection / Custom Duration Chip */
function CustomDurationChip({
  selected = false,
  children = '직접 입력',
  className,
  type = 'button',
  ...props
}: CustomDurationChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'radius-full inline-flex h-[37px] items-center px-x3_5 py-x2',
        selected
          ? 'body2-semibold text-text-accent bg-fill-primary-50 border-line-accent border-[1.5px] border-solid'
          : 'body2-regular text-fill-secondary-500 bg-bg-0 border-fill-secondary-300 border border-dashed',
        className
      )}
      {...props}
    >
      {children}
      <PlusIcon />
    </button>
  );
}

export { CustomDurationChip };
export type { CustomDurationChipProps };

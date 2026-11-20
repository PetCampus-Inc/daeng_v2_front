import { type ComponentProps, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@knockdog/ui/lib';

const ticketValueBoxVariants = cva(
  'radius-r3 bg-bg-0 flex w-full items-center justify-between border border-solid py-x4 pr-x3 pl-x4',
  {
    variants: {
      state: {
        placeholder: 'border-line-200',
        filled: 'border-line-200',
        selected: 'border-line-accent',
      },
    },
    defaultVariants: {
      state: 'placeholder',
    },
  }
);

type TicketValueState = 'placeholder' | 'filled' | 'selected';

interface TicketValueFieldProps extends VariantProps<typeof ticketValueBoxVariants> {
  value?: ReactNode;
  placeholder?: ReactNode;
  state?: TicketValueState;
  className?: string;
  onClick?: ComponentProps<'button'>['onClick'];
}

function ChevronRight(props: ComponentProps<'svg'>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path d='M9 18L15 12L9 6' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

/** V4 / Input / Ticket Value */
function TicketValueField({
  value,
  placeholder = '날짜를 선택하세요',
  state = 'placeholder',
  className,
  onClick,
}: TicketValueFieldProps) {
  const isPlaceholder = state === 'placeholder';

  return (
    <button type='button' onClick={onClick} className={cn(ticketValueBoxVariants({ state }), className)}>
      <span className={cn('body1-medium pl-x1', isPlaceholder ? 'text-text-secondary-inverse' : 'text-text-primary')}>
        {isPlaceholder ? placeholder : value}
      </span>
      <ChevronRight className='text-text-secondary-inverse shrink-0' />
    </button>
  );
}

export { TicketValueField };
export type { TicketValueFieldProps, TicketValueState };

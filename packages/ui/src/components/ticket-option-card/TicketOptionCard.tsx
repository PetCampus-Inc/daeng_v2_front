import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

type TicketOptionType = 'custom' | 'preset';

interface TicketOptionCardProps extends Omit<ComponentProps<'button'>, 'children' | 'title'> {
  optionType?: TicketOptionType;
  selected?: boolean;
  title: ReactNode;
  description?: ReactNode;
}

function ChevronDown(props: ComponentProps<'svg'>) {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M4 6L8 10L12 6'
        stroke='currentColor'
        strokeWidth='1.33333'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Selection / Ticket Option Card */
function TicketOptionCard({
  optionType = 'custom',
  selected = false,
  title,
  description = '10회 • 만료 없음',
  className,
  type = 'button',
  ...props
}: TicketOptionCardProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'radius-r3 bg-bg-0 flex w-full items-center border border-solid py-x4 pr-x3 pl-x4',
        selected ? 'border-line-accent' : 'border-line-200',
        className
      )}
      {...props}
    >
      <span className='flex min-w-0 flex-1 items-center justify-between'>
        <span className={cn('flex min-w-0 flex-col items-start', optionType === 'preset' && 'gap-x1')}>
          <span className='body1-medium text-text-primary'>{title}</span>
          {optionType === 'preset' ? <span className='caption1-regular text-fill-secondary-500'>{description}</span> : null}
        </span>
        <span className='-rotate-90 shrink-0'>
          <ChevronDown className='text-text-secondary-inverse' />
        </span>
      </span>
    </button>
  );
}

export { TicketOptionCard };
export type { TicketOptionCardProps, TicketOptionType };

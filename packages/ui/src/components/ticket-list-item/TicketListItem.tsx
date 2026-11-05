import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface TicketListItemProps extends Omit<ComponentProps<'button'>, 'children'> {
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

/** V4 / List / Ticket Item */
function TicketListItem({
  title,
  description = '충전 횟수 • 유효기간',
  className,
  type = 'button',
  ...props
}: TicketListItemProps) {
  return (
    <button
      type={type}
      className={cn(
        'radius-r3 bg-bg-0 border-line-200 flex w-full items-center border border-solid py-x4 pr-x3 pl-x4',
        className
      )}
      {...props}
    >
      <span className='flex min-w-0 flex-1 items-center justify-between'>
        <span className='flex min-w-0 flex-col items-start gap-x1'>
          <span className='body1-medium text-text-primary'>{title}</span>
          {description ? <span className='caption1-regular text-fill-secondary-500'>{description}</span> : null}
        </span>
        <span className='-rotate-90 shrink-0'>
          <ChevronDown className='text-text-secondary-inverse' />
        </span>
      </span>
    </button>
  );
}

export { TicketListItem };
export type { TicketListItemProps };

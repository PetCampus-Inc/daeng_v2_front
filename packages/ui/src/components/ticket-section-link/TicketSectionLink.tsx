import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface TicketSectionLinkProps extends Omit<ComponentProps<'button'>, 'children'> {
  children?: ReactNode;
}

function ChevronRight(props: ComponentProps<'svg'>) {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M14.6499 9.23977L15.5356 9.99856L14.6499 10.7573L7.64987 16.7573L6.34909 15.2398L12.4633 9.99856L6.34909 4.75734L7.64987 3.23977L14.6499 9.23977Z'
        fill='currentColor'
      />
    </svg>
  );
}

/** V4 / Navigation / Ticket Section Link */
function TicketSectionLink({ children = '이용권', className, type = 'button', ...props }: TicketSectionLinkProps) {
  return (
    <button type={type} className={cn('inline-flex items-center gap-x1', className)} {...props}>
      <span className='h3-extrabold text-text-primary'>{children}</span>
      <ChevronRight className='text-text-primary' />
    </button>
  );
}

export { TicketSectionLink };
export type { TicketSectionLinkProps };

import { type ComponentProps } from 'react';

import { cn } from '@knockdog/ui/lib';

interface NextIconButtonProps extends ComponentProps<'button'> {
  filled?: boolean;
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

/** V4 / Button / Next Icon */
function NextIconButton({ filled = true, className, type = 'button', ...props }: NextIconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'radius-full inline-flex size-8 items-center justify-center',
        filled && 'bg-fill-secondary-50',
        className
      )}
      {...props}
    >
      <span className='-rotate-90'>
        <ChevronDown className='text-text-secondary-inverse' />
      </span>
    </button>
  );
}

export { NextIconButton };
export type { NextIconButtonProps };

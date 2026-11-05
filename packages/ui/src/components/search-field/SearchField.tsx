import { type ComponentProps } from 'react';

import { cn } from '@knockdog/ui/lib';

interface SearchFieldProps extends ComponentProps<'input'> {}

function SearchIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M15.7498 15.75L12.4948 12.495'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.25 8.25C14.25 11.5637 11.5637 14.25 8.25 14.25C4.93629 14.25 2.25 11.5637 2.25 8.25C2.25 4.93629 4.93629 2.25 8.25 2.25C11.5637 2.25 14.25 4.93629 14.25 8.25Z'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** V4 / Input / Search Field */
function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <label className={cn('bg-fill-secondary-50 border-line-100 radius-r5 flex w-full items-center gap-x2 border p-x4', className)}>
      <SearchIcon className='text-text-secondary shrink-0' />
      <input
        className='body1-medium text-text-primary placeholder:text-fill-secondary-500 min-w-0 flex-1 bg-transparent outline-none'
        {...props}
      />
    </label>
  );
}

export { SearchField };
export type { SearchFieldProps };

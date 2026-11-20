import { type ComponentProps, type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

interface SectionHeaderProps extends Omit<ComponentProps<'button'>, 'children' | 'title'> {
  title: ReactNode;
  address: ReactNode;
  imageSrc: string;
  imageAlt?: string;
}

function NextMark({ filled = false }: { filled?: boolean }) {
  return (
    <span
      className={cn(
        'radius-full inline-flex size-8 shrink-0 items-center justify-center',
        filled && 'bg-fill-secondary-50'
      )}
    >
      <span className='-rotate-90'>
        <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M4 6L8 10L12 6'
            stroke='currentColor'
            strokeWidth='1.33333'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-text-secondary-inverse'
          />
        </svg>
      </span>
    </span>
  );
}

/** V4 / Typography / Section Header */
function SectionHeader({ title, address, imageSrc, imageAlt = '', className, type = 'button', ...props }: SectionHeaderProps) {
  return (
    <button
      type={type}
      className={cn(
        'radius-r4 border-line-200 relative flex h-[210px] w-full flex-col items-center justify-end overflow-hidden border border-solid',
        className
      )}
      {...props}
    >
      <img alt={imageAlt} src={imageSrc} className='absolute inset-0 size-full object-cover' />
      <span className='absolute inset-0 bg-black/20' />
      <span className='bg-bg-50 relative flex w-full items-center justify-between pt-x4 pr-x4 pb-x5 pl-x5 shadow-[0_4px_4px_rgba(0,0,0,0.25)]'>
        <span className='flex min-w-0 flex-col items-start gap-x1'>
          <span className='h3-semibold text-text-primary'>{title}</span>
          <span className='caption1-regular text-fill-secondary-500'>{address}</span>
        </span>
        <NextMark />
      </span>
    </button>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };

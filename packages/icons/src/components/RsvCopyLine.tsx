import { type SVGProps, useId } from 'react';

/** V4 / Icon / Guardian reservation copy */
export function RsvCopyLine({ className, ...props }: SVGProps<SVGSVGElement>) {
  const clipId = useId().replace(/:/g, '');

  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className={className} {...props}>
      <g clipPath={`url(#${clipId})`}>
        <path
          d='M6.66667 5.33333H13.3333C14.0697 5.33333 14.6667 5.93029 14.6667 6.66667V13.3333C14.6667 14.0697 14.0697 14.6667 13.3333 14.6667H6.66667C5.93029 14.6667 5.33333 14.0697 5.33333 13.3333V6.66667C5.33333 5.93029 5.93029 5.33333 6.66667 5.33333Z'
          stroke='currentColor'
          strokeWidth='1.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M2.66667 10.6667C1.93333 10.6667 1.33333 10.0667 1.33333 9.33333V2.66667C1.33333 1.93333 1.93333 1.33333 2.66667 1.33333H9.33333C10.0667 1.33333 10.6667 1.93333 10.6667 2.66667'
          stroke='currentColor'
          strokeWidth='1.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width='16' height='16' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}

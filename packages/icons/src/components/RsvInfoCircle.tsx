import { type SVGProps, useId } from 'react';

/** V4 / Icon / Guardian reservation info */
export function RsvInfoCircle({ className, ...props }: SVGProps<SVGSVGElement>) {
  const clipId = useId().replace(/:/g, '');

  return (
    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg' className={className} {...props}>
      <g clipPath={`url(#${clipId})`}>
        <path
          d='M12.8333 7C12.8333 10.2217 10.2217 12.8333 7 12.8333C3.77834 12.8333 1.16667 10.2217 1.16667 7C1.16667 3.77834 3.77834 1.16667 7 1.16667C10.2217 1.16667 12.8333 3.77834 12.8333 7Z'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path d='M7 4.66667V7' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
        <path d='M7 9.33333H7.005' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width='14' height='14' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
}

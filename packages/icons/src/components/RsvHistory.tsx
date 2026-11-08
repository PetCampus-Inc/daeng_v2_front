import type { SVGProps } from 'react';

/** V4 / Icon / Guardian reservation history */
export function RsvHistory({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={className} {...props}>
      <path d='M16 13V15.2L17.6 16.2' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M3 12H6.458' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M3 19H6.832' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path d='M3 5H21' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M22 15C22 18.3137 19.3137 21 16 21C12.6863 21 10 18.3137 10 15C10 11.6863 12.6863 9 16 9C19.3137 9 22 11.6863 22 15Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

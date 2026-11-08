import type { SVGProps } from 'react';

/** V4 / Icon / Guardian my */
export function MyNav({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width='21'
      height='21'
      viewBox='0 0 21 21'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      {...props}
    >
      <path
        d='M14.875 7C14.875 9.41625 12.9162 11.375 10.5 11.375C8.08375 11.375 6.125 9.41625 6.125 7C6.125 4.58375 8.08375 2.625 10.5 2.625C12.9162 2.625 14.875 4.58375 14.875 7Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M17.5 18.375C17.5 16.5185 16.7625 14.738 15.4497 13.4253C14.137 12.1125 12.3565 11.375 10.5 11.375C8.64348 11.375 6.86301 12.1125 5.55025 13.4253C4.2375 14.738 3.5 16.5185 3.5 18.375'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

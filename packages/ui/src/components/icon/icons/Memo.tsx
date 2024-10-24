import * as React from 'react';
import type { SVGProps } from 'react';
const SvgMemo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#fff'
      d='M4.57 7.548a2.476 2.476 0 0 1 2.476-2.476h9.904a2.476 2.476 0 0 1 2.476 2.476v9.904a2.476 2.476 0 0 1-2.476 2.476H7.046a2.476 2.476 0 0 1-2.476-2.476z'
    />
    <path
      fill='#C8A584'
      fillRule='evenodd'
      d='M17.335 5.832H6.667c-.736 0-1.333.597-1.333 1.333v10.668c0 .737.597 1.334 1.333 1.334h10.668c.736 0 1.334-.598 1.334-1.334V7.165c0-.736-.598-1.333-1.334-1.333M6.667 4.498A2.667 2.667 0 0 0 4 7.165v10.668A2.667 2.667 0 0 0 6.667 20.5h10.668a2.667 2.667 0 0 0 2.667-2.667V7.165a2.667 2.667 0 0 0-2.667-2.667z'
      clipRule='evenodd'
    />
    <path
      fill='#EE7821'
      fillRule='evenodd'
      d='M8.001 7.831a.667.667 0 1 1-1.333 0V4.498h1.333z'
      clipRule='evenodd'
    />
    <path
      fill='#E9E9E9'
      d='M6.668 9.832h10.668v1.333H6.668zM6.668 12.499h8v1.333h-8zM6.668 15.166h8V16.5h-8z'
    />
  </svg>
);
export default SvgMemo;

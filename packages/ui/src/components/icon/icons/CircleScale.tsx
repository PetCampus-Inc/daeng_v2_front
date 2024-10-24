import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleScale = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 20 21'
    {...props}
  >
    <rect width={20} height={20} y={0.5} fill='#FFF0C8' rx={10} />
    <path
      fill='#956F4C'
      d='M3.707 5.89c0-.929.753-1.682 1.682-1.682h9.252c.93 0 1.682.753 1.682 1.682v9.252c0 .93-.753 1.682-1.682 1.682H5.39a1.68 1.68 0 0 1-1.682-1.682z'
    />
    <path
      fill='#C8A584'
      d='M4.41 7.775a.841.841 0 0 1 1.265-.727L9.17 9.087a1.68 1.68 0 0 0 1.695 0l3.495-2.039a.841.841 0 0 1 1.265.727v6.666c0 .93-.754 1.682-1.683 1.682h-7.85a1.68 1.68 0 0 1-1.682-1.682z'
    />
    <path
      fill='#EEE3D9'
      d='M7.507 6.951a.841.841 0 0 1 .675-1.342h3.67c.69 0 1.087.787.676 1.342l-.312.42a.84.84 0 0 1-.675.341H8.494a.84.84 0 0 1-.676-.34z'
    />
    <path fill='#FFF0C8' d='M7.564 14.722a.35.35 0 0 1 .35.35' />
    <path
      fill='#DD5435'
      fillRule='evenodd'
      d='M10.365 6.661a.35.35 0 0 0-.7 0v1.051h.7z'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCircleScale;

import * as React from 'react';
import type { SVGProps } from 'react';
const SvgExit = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      stroke='#292929'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M11 6.5h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7M7.81 8.5 4 12.5m0 0 3.81 4M4 12.5h8'
    />
  </svg>
);
export default SvgExit;

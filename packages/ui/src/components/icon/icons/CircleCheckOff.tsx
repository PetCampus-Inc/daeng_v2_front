import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleCheckOff = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 28 29'
    {...props}
  >
    <circle cx={14} cy={14.5} r={10} fill='#E9E9E9' />
    <path
      stroke='#B5B5B5'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='m9 13.558 3.685 3.942 6.315-6'
    />
  </svg>
);
export default SvgCircleCheckOff;

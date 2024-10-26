import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleCheckOn = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 28 29'
    {...props}
  >
    <circle cx={14} cy={14.5} r={10} fill='#956F4C' />
    <path
      stroke='#fff'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='m9 13.558 3.685 3.942 6.315-6'
    />
  </svg>
);
export default SvgCircleCheckOn;

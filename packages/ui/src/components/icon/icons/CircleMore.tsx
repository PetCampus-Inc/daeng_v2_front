import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleMore = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 18 19'
    {...props}
  >
    <circle cx={9} cy={9.5} r={6} fill='#956F4C' />
    <path
      fill='#EEE3D9'
      fillRule='evenodd'
      d='M5.496 9.5a.7.7 0 1 1 1.402 0 .7.7 0 0 1-1.402 0m2.804 0a.7.7 0 1 1 1.402 0 .7.7 0 0 1-1.402 0m3.504-.701a.7.7 0 1 0 0 1.402.7.7 0 0 0 0-1.402'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCircleMore;

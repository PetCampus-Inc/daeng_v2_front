import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleExclamationMark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 18 19'
    {...props}
  >
    <circle cx={9} cy={9.5} r={6} fill='#B5B5B5' />
    <path
      fill='#F7F7F7'
      fillRule='evenodd'
      d='M9 5.795a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-.75-.75m0 6.08a.665.665 0 1 0 0 1.33.665.665 0 0 0 0-1.33'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCircleExclamationMark;

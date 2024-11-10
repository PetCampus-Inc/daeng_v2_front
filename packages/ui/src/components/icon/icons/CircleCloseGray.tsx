import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleCloseGray = (props: SVGProps<SVGSVGElement>) => (
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
      fill='#E9E9E9'
      fillRule='evenodd'
      d='M6.5 7a.707.707 0 0 0 0 1L8 9.5 6.5 11a.707.707 0 0 0 1 1L9 10.5l1.5 1.5a.707.707 0 1 0 1-1L10 9.5 11.5 8a.707.707 0 1 0-1-1L9 8.5 7.5 7a.707.707 0 0 0-1 0'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCircleCloseGray;

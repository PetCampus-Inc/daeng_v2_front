import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleFemale = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule='evenodd'
      d='M10 11.333a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666m.833 1.598A5.001 5.001 0 0 0 10 3a5 5 0 0 0-.833 9.93v.903H7.5a.833.833 0 0 0 0 1.667h1.667v2.113a.833.833 0 1 0 1.666 0V15.5H12.5a.833.833 0 0 0 0-1.667h-1.667z'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCircleFemale;

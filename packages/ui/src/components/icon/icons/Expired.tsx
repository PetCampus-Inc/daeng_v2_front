import * as React from 'react';
import type { SVGProps } from 'react';
const SvgExpired = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#EEE3D9'
      d='M5 7.25c0-.966.784-1.75 1.75-1.75h10.5c.966 0 1.75.784 1.75 1.75v10.5a1.75 1.75 0 0 1-1.75 1.75H6.75A1.75 1.75 0 0 1 5 17.75z'
    />
    <path
      fill='#956F4C'
      d='M5 7c0-.828.784-1.5 1.75-1.5h10.5c.966 0 1.75.672 1.75 1.5v1.5H5z'
    />
    <path
      fill='#525252'
      d='M7 4.5a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0zM15 4.5a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0z'
    />
    <path
      fill='#956F4C'
      fillRule='evenodd'
      d='M11.999 10.19a.667.667 0 0 0-.667.667v2.667a.667.667 0 0 0 1.333 0v-2.667A.667.667 0 0 0 12 10.19M12 15.595a.591.591 0 1 0 0 1.182.591.591 0 0 0 0-1.182'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgExpired;

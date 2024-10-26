import * as React from 'react';
import type { SVGProps } from 'react';
const SvgPicture = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <rect width={14} height={14} x={5} y={5.5} fill='#C8A584' rx={1} />
    <rect
      width={11.667}
      height={9.333}
      x={6.168}
      y={6.667}
      fill='#E4CAB1'
      rx={1}
    />
    <path
      fill='#fff'
      d='m10.079 12.089-2.204 2.204c-.63.63-.184 1.707.707 1.707h4.132c.86 0 1.319-1.012.753-1.659l-1.928-2.204a1 1 0 0 0-1.46-.048'
    />
    <path
      fill='#fff'
      d='m13.834 13.186-1.157 1.085c-.662.62-.223 1.729.684 1.729h2.17c.874 0 1.327-1.043.73-1.682l-1.012-1.085a1 1 0 0 0-1.415-.048'
    />
    <circle cx={15.499} cy={9} r={1.167} fill='#fff' />
  </svg>
);
export default SvgPicture;

import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCircleMale = (props: SVGProps<SVGSVGElement>) => (
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
      d='M11.556 6.226a.833.833 0 0 1 0-1.666h3.333c.46 0 .834.373.834.833v3.333a.833.833 0 0 1-1.667 0V7.432l-1.961 1.961a5 5 0 1 1-1.143-1.214l1.953-1.953zm-.29 5.94a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.667 0'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCircleMale;

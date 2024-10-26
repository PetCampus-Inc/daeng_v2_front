import * as React from 'react';
import type { SVGProps } from 'react';
const SvgArrowDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M18.606 9.035a1 1 0 0 1 0 1.415l-5.652 5.65-.005.006a1 1 0 0 1-1.415 0L5.878 10.45a1 1 0 0 1 1.414-1.415l4.95 4.95 4.95-4.95a1 1 0 0 1 1.413 0'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgArrowDown;

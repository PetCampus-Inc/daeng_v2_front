import * as React from 'react';
import type { SVGProps } from 'react';
const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => (
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
      d='M15.778 6.207a1 1 0 0 0-1.414 0l-5.651 5.651-.006.006a1 1 0 0 0 0 1.414l5.657 5.657a1 1 0 0 0 1.414-1.414l-4.95-4.95 4.95-4.95a1 1 0 0 0 0-1.414'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgArrowLeft;

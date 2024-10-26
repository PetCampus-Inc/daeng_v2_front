import * as React from 'react';
import type { SVGProps } from 'react';
const SvgClose = (props: SVGProps<SVGSVGElement>) => (
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
      stroke='currentColor'
      d='M17.747 17.035a.858.858 0 1 1-1.214 1.214L12 13.714l-4.535 4.533a.859.859 0 0 1-1.214-1.214l4.535-4.533-4.533-4.534a.858.858 0 1 1 1.214-1.214L12 11.287l4.535-4.536a.858.858 0 1 1 1.214 1.214L13.214 12.5z'
    />
  </svg>
);
export default SvgClose;

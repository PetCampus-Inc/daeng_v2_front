import * as React from 'react';
import type { SVGProps } from 'react';
const SvgDocument = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#fff'
      stroke='#E4CAB1'
      d='M17 4a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 17 21H7a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 7 4z'
    />
    <path fill='#E9E9E9' d='M7.039 7.104h8v1h-8zM7.039 9.104h6v1h-6z' />
    <path
      fill='#E4CAB1'
      d='M16 12.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z'
    />
  </svg>
);
export default SvgDocument;

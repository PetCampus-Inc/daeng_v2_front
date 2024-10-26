import * as React from 'react';
import type { SVGProps } from 'react';
const SvgLetter = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 16 17'
    {...props}
  >
    <path
      fill='#fff'
      d='M3 5.813c0-.484.23-.875.955-.875h8.59c.725 0 .955.391.955.875v5.25c0 .483-.588.874-1.312.874H4.312c-.724 0-1.312-.391-1.312-.874z'
    />
    <path fill='#E9E9E9' d='M8.25 9.02 3.875 4.939h8.75z' />
    <circle cx={8.253} cy={9.02} r={1.167} fill='#C8A584' />
  </svg>
);
export default SvgLetter;

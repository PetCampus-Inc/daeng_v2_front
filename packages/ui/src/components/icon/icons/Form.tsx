import * as React from 'react';
import type { SVGProps } from 'react';
const SvgForm = (props: SVGProps<SVGSVGElement>) => (
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
    <path fill='#E9E9E9' d='M7 6.618h8v1H7zM7 8.618h6v1H7zM7 10.5h6v1H7z' />
    <path
      fill='#956F4C'
      d='M15.858 19.498a.645.645 0 0 1-.882.236l-1.118-.646a.646.646 0 0 1-.236-.881l2.904-5.031a.646.646 0 0 1 .882-.236l1.118.645a.645.645 0 0 1 .236.882z'
    />
    <path
      fill='#C8A584'
      d='m18.441 15.027-2.236-1.29.646-1.119a1.291 1.291 0 0 1 2.236 1.291z'
    />
    <path fill='#FFF0C8' d='m17.473 16.703-2.236-1.29.645-1.119 2.236 1.291z' />
    <path fill='#956F4C' d='m14.019 20.176 1.494-.395-1.967-1.136z' />
  </svg>
);
export default SvgForm;

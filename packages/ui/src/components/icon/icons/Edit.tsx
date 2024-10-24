import * as React from 'react';
import type { SVGProps } from 'react';
const SvgEdit = (props: SVGProps<SVGSVGElement>) => (
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
      d='M2.668 4.938c0-.737.597-1.334 1.333-1.334h8c.737 0 1.334.597 1.334 1.334v8c0 .736-.597 1.333-1.334 1.333h-8a1.333 1.333 0 0 1-1.333-1.333z'
    />
    <path
      fill='#EEE3D9'
      fillRule='evenodd'
      d='M4 2.938h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2m0 .666c-.736 0-1.333.597-1.333 1.334v8c0 .736.597 1.333 1.333 1.333h8c.736 0 1.333-.597 1.333-1.334v-8c0-.736-.597-1.333-1.333-1.333z'
      clipRule='evenodd'
    />
    <path
      fill='#956F4C'
      d='M6.283 12.533a.667.667 0 0 1-.911.244l-1.155-.667a.667.667 0 0 1-.244-.91l3-5.196a.667.667 0 0 1 .91-.244l1.156.666a.667.667 0 0 1 .244.91z'
    />
    <path
      fill='#C8A584'
      d='M8.95 7.913 6.64 6.58l.666-1.155a1.333 1.333 0 0 1 2.31 1.333z'
    />
    <path fill='#FFF0C8' d='M7.95 9.646 5.64 8.312l.666-1.155 2.31 1.334z' />
    <path fill='#956F4C' d='m4.386 13.232 1.544-.407-2.033-1.174z' />
    <path fill='#858585' d='M12 12.27v.667H8v-.666z' />
  </svg>
);
export default SvgEdit;

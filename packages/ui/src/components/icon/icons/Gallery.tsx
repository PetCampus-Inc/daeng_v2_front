import * as React from 'react';
import type { SVGProps } from 'react';
const SvgGallery = (props: SVGProps<SVGSVGElement>) => (
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
      d='M7 4.5h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-10a3 3 0 0 1 3-3m11 3v7h-3.555l-.015-.016-1.012-1.085a1 1 0 0 0-1.415-.047l-.393.367-1.238-1.415a1 1 0 0 0-1.46-.048L6.71 14.46l-.038.04H6v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1m-12 10v-1h12v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1m9.167-7.667a1.167 1.167 0 1 0 0-2.333 1.167 1.167 0 0 0 0 2.333'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgGallery;

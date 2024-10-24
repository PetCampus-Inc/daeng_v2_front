import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCard = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#956F4C'
      d='M4 8.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'
    />
    <path fill='#525252' d='M4 9.5h16v2H4z' />
    <path
      fill='#EEE3D9'
      d='M13 16a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5'
    />
    <path
      fill='#FFCD4D'
      d='M5 15.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1z'
    />
    <path
      fill='#F6BA1E'
      fillRule='evenodd'
      d='M6.898 16.5v-4h.2v4zM8.898 16.5v-4h.2v4z'
      clipRule='evenodd'
    />
    <path
      fill='#F6BA1E'
      fillRule='evenodd'
      d='M9 13.4h2v.2H9zM5 13.4h2v.2H5zM5 15.4h2v.2H5zM9 15.4h2v.2H9z'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgCard;

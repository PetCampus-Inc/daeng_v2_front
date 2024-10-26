import * as React from 'react';
import type { SVGProps } from 'react';
const SvgDogManage = (props: SVGProps<SVGSVGElement>) => (
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
      d='M4 6.382C4 5.342 4.895 4.5 6 4.5h12c1.105 0 2 .843 2 1.882v12.236c0 1.04-.895 1.882-2 1.882H6c-1.105 0-2-.843-2-1.882z'
    />
    <path fill='#525252' d='M7 4.5h10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2' />
    <path
      fill='#525252'
      d='M10 5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 0 3h-1A1.5 1.5 0 0 1 10 5'
    />
    <path
      fill='#EEE3D9'
      d='M6 10.264c0-1.005.895-1.819 2-1.819h8c1.105 0 2 .814 2 1.819v6.363c0 1.004-.895 1.818-2 1.818H8c-1.105 0-2-.814-2-1.818z'
    />
    <path
      fill='#C8A584'
      fillRule='evenodd'
      d='M14.883 11.653a.507.507 0 0 0-.717 0l-2.508 2.509-1.793-1.792a.507.507 0 1 0-.717.716l2.137 2.137.014.014a.507.507 0 0 0 .717 0l2.867-2.867a.507.507 0 0 0 0-.717'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgDogManage;

import * as React from 'react';
import type { SVGProps } from 'react';
const SvgPrecautions = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <rect width={24} height={24} y={0.5} fill='#EEE3D9' rx={12} />
    <path
      fill='#fff'
      d='M6 5.389c0-.491.384-.889.857-.889h10.286c.473 0 .857.398.857.889V19.61c0 .491-.384.889-.857.889H6.857c-.473 0-.857-.398-.857-.889z'
    />
    <path
      fill='#956F4C'
      fillRule='evenodd'
      d='M17.143 5.389H6.857V19.61h10.286zM6.857 4.5c-.473 0-.857.398-.857.889V19.61c0 .491.384.889.857.889h10.286c.473 0 .857-.398.857-.889V5.39c0-.491-.384-.889-.857-.889z'
      clipRule='evenodd'
    />
    <path fill='#E9E9E9' d='M16 8.5v1H8v-1zM16 11.5v1H8v-1zM13 14.5v1H8v-1z' />
    <path
      fill='#956F4C'
      d='M15.586 18.733a.57.57 0 0 1-.779.209l-.986-.57a.57.57 0 0 1-.209-.778l2.564-4.44a.57.57 0 0 1 .778-.208l.986.57a.57.57 0 0 1 .209.777z'
    />
    <path
      fill='#C8A584'
      d='m17.863 14.787-1.973-1.14.57-.986a1.14 1.14 0 1 1 1.973 1.14z'
    />
    <path fill='#FFF0C8' d='m17.008 16.267-1.973-1.14.57-.986 1.972 1.139z' />
    <path fill='#956F4C' d='m13.962 19.331 1.32-.348-1.737-1.003z' />
  </svg>
);
export default SvgPrecautions;

import * as React from 'react';
import type { SVGProps } from 'react';
const SvgAllergy = (props: SVGProps<SVGSVGElement>) => (
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
    <rect
      width={2.108}
      height={6.324}
      x={11.109}
      y={5.5}
      fill='#956F4C'
      rx={0.527}
    />
    <rect
      width={2.108}
      height={6.324}
      x={15.324}
      y={7.608}
      fill='#956F4C'
      rx={0.527}
      transform='rotate(90 15.324 7.608)'
    />
    <path fill='#E9E9E9' d='M7 13.5h8v1H7zM7 15.5h6v1H7z' />
  </svg>
);
export default SvgAllergy;

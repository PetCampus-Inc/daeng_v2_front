import * as React from 'react';
import type { SVGProps } from 'react';
const SvgInjury = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule='evenodd'
      d='M16.117 6.269H7.963l-.43 4.611h9.013zM7.963 5.5a.766.766 0 0 0-.76.697l-.43 4.611c-.042.451.31.84.76.84h9.013c.45 0 .803-.389.76-.84l-.429-4.611a.766.766 0 0 0-.76-.697z'
      clipRule='evenodd'
    />
    <rect
      width={16.338}
      height={9.486}
      x={4.133}
      y={9.014}
      fill='#fff'
      rx={1.581}
    />
    <path stroke='#E4CAB1' strokeWidth={0.791} d='M4.133 13.757h4.48' />
    <rect
      width={2.108}
      height={6.324}
      x={11.25}
      y={10.595}
      fill='#956F4C'
      rx={0.527}
    />
    <rect
      width={2.108}
      height={6.324}
      x={15.465}
      y={12.703}
      fill='#956F4C'
      rx={0.527}
      transform='rotate(90 15.465 12.703)'
    />
    <path stroke='#E4CAB1' strokeWidth={0.791} d='M15.992 13.757h4.48' />
  </svg>
);
export default SvgInjury;

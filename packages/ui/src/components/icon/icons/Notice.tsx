import * as React from 'react';
import type { SVGProps } from 'react';
const SvgNotice = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#525252'
      d='M8.996 11.755c.552 0 1 .358 1 .8v6.4c0 .442-.448.8-1 .8s-1-.358-1-.8v-6.4c0-.442.448-.8 1-.8'
    />
    <path
      fill='#E4CAB1'
      stroke='#E4CAB1'
      d='M17.809 9.755a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z'
    />
    <path
      fill='#EEE3D9'
      d='m8.996 6.755 6.762-1.69a1 1 0 0 1 1.242.97v7.44a1 1 0 0 1-1.242.97l-6.762-1.69z'
    />
    <path
      fill='#C8A584'
      d='M16.5 4.755a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5'
    />
    <path
      fill='#956F4C'
      fillRule='evenodd'
      d='M8.996 6.755a3 3 0 0 0 0 6z'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgNotice;

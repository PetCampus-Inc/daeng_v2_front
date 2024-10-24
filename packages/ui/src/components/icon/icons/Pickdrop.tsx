import * as React from 'react';
import type { SVGProps } from 'react';
const SvgPickdrop = (props: SVGProps<SVGSVGElement>) => (
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
      d='M5 16.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM15 16.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z'
    />
    <path
      fill='#D8EEFA'
      d='M6.54 6.22a1 1 0 0 1 .96-.72h9a1 1 0 0 1 .96.72l1.166 4a1 1 0 0 1-.96 1.28H6.333a1 1 0 0 1-.96-1.28z'
    />
    <path
      fill='#956F4C'
      fillRule='evenodd'
      d='M16.5 6.5h-9l-1.167 4h11.333zm-9-1a1 1 0 0 0-.96.72l-1.167 4a1 1 0 0 0 .96 1.28h11.333a1 1 0 0 0 .96-1.28l-1.167-4a1 1 0 0 0-.96-.72z'
      clipRule='evenodd'
    />
    <path
      fill='#956F4C'
      d='M4 11.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z'
    />
    <path
      fill='#956F4C'
      fillRule='evenodd'
      d='M18 10.5H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-12-1a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z'
      clipRule='evenodd'
    />
    <path
      fill='#F6F1ED'
      d='M3 16.5a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1M7 13.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0M15 13.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0'
    />
    <path fill='#E4F6FF' d='m9 9.5 2.5-3H15l-2.5 3z' />
  </svg>
);
export default SvgPickdrop;

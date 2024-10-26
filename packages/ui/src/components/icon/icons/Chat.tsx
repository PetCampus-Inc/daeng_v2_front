import * as React from 'react';
import type { SVGProps } from 'react';
const SvgChat = (props: SVGProps<SVGSVGElement>) => (
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
      d='M20 11.313c0 3.21-3.582 5.813-8 5.813s-8-2.603-8-5.813S7.582 5.5 12 5.5s8 2.603 8 5.813'
    />
    <path
      fill='#956F4C'
      d='M8.71 14.52a.45.45 0 0 1 .495-.286l2.966.49a.45.45 0 0 1 .19.81l-4.316 3.1a.45.45 0 0 1-.684-.524z'
    />
    <path
      fill='#FFF7E1'
      d='M9.337 11.214a1.143 1.143 0 1 1-2.286 0 1.143 1.143 0 0 1 2.285 0M13.145 11.214a1.143 1.143 0 1 1-2.286 0 1.143 1.143 0 0 1 2.286 0M16.954 11.214a1.143 1.143 0 1 1-2.286 0 1.143 1.143 0 0 1 2.286 0'
    />
  </svg>
);
export default SvgChat;

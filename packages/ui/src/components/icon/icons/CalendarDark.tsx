import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCalendarDark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 16 17'
    {...props}
  >
    <rect width={16} height={16} y={0.938} fill='#956F4C' rx={8} />
    <path
      fill='#fff'
      d='M3.332 6.106c0-.644.522-1.167 1.166-1.167h7c.643 0 1.166.523 1.166 1.167v6.999c0 .644-.523 1.166-1.167 1.166H4.498a1.166 1.166 0 0 1-1.166-1.166z'
    />
    <path
      fill='#FFCD4D'
      d='M3.332 6.106c0-.644.522-1.167 1.166-1.167h7c.643 0 1.166.523 1.166 1.167v1.166H3.332z'
    />
    <path
      fill='#525252'
      d='M4.5 4.357a.583.583 0 0 1 1.166 0v1.166a.583.583 0 0 1-1.166 0z'
    />
    <path
      fill='#E4CAB1'
      d='M4.5 9.023c0-.322.261-.584.583-.584h3.5a.583.583 0 0 1 0 1.167h-3.5a.583.583 0 0 1-.583-.583M4.5 11.355c0-.322.261-.584.583-.584h5.833a.583.583 0 1 1 0 1.167H5.083a.583.583 0 0 1-.583-.583'
    />
    <path
      fill='#525252'
      d='M10.332 4.357a.583.583 0 0 1 1.166 0v1.166a.583.583 0 1 1-1.166 0z'
    />
  </svg>
);
export default SvgCalendarDark;

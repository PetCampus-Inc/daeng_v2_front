import * as React from 'react';
import type { SVGProps } from 'react';
const SvgNotificationOff = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#292929'
      fillRule='evenodd'
      d='m13.134 4.717.003-.092c0-.621-.511-1.125-1.143-1.125a1.134 1.134 0 0 0-1.138 1.221 6.86 6.86 0 0 0-5.708 6.761v4.243a.15.15 0 0 1-.148.149 1 1 0 0 0-1 1v.25a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-.25a1 1 0 0 0-1-1 .137.137 0 0 1-.137-.138v-4.254a6.86 6.86 0 0 0-5.73-6.765M9.702 19.25c.056 1.253 1.058 2.25 2.286 2.25s2.229-.997 2.285-2.25z'
      clipRule='evenodd'
    />
    <path
      stroke='#292929'
      strokeLinecap='round'
      strokeWidth={2}
      d='m4 5 15 15'
    />
  </svg>
);
export default SvgNotificationOff;

import * as React from 'react';
import type { SVGProps } from 'react';
const SvgNotificationBadge = (props: SVGProps<SVGSVGElement>) => (
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
      d='M13.137 4.625q0 .047-.004.092.743.125 1.423.398c-.174.363-.27.77-.27 1.197 0 1.554 1.278 2.813 2.856 2.813.43 0 .838-.094 1.203-.26.334.806.518 1.69.518 2.617v4.254c0 .076.061.137.137.137a1 1 0 0 1 1 1v.25a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-.25a1 1 0 0 1 1-1 .15.15 0 0 0 .148-.148v-4.243a6.86 6.86 0 0 1 5.708-6.761A1.134 1.134 0 0 1 11.995 3.5c.63 0 1.142.504 1.142 1.125m2.439 1.001a6.9 6.9 0 0 1 2.253 2.233c-.21.09-.443.14-.687.14-.947 0-1.714-.755-1.714-1.687 0-.244.053-.476.148-.686M11.988 21.5c-1.228 0-2.23-.997-2.286-2.25h4.571c-.056 1.253-1.058 2.25-2.285 2.25'
      clipRule='evenodd'
    />
    <path fill='#EE7821' d='M20 6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0' />
  </svg>
);
export default SvgNotificationBadge;

import * as React from 'react';
import type { SVGProps } from 'react';
const SvgTrash = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='currentColor'
      fillRule='evenodd'
      d='M6.033 8.5a.4.4 0 0 0-.392.482l2.241 10.723a1 1 0 0 0 .979.795h6.294a1 1 0 0 0 .978-.795l2.241-10.723a.4.4 0 0 0-.391-.482zm3.388 2a.43.43 0 0 0-.431.431v7.138a.431.431 0 0 0 .862 0V10.93a.43.43 0 0 0-.431-.431m2.156.431a.431.431 0 0 1 .862 0v7.138a.431.431 0 1 1-.862 0zm3.018-.431a.43.43 0 0 0-.431.431v7.138a.431.431 0 1 0 .862 0V10.93a.43.43 0 0 0-.431-.431M13.592 4.5h-3.2a1.4 1.4 0 0 0-1.4 1.4v.6H5.51c-.565 0-.708.784-.18.984q.044.016.09.016H18.58q.046 0 .09-.016c.529-.2.386-.984-.18-.984h-3.498v-.6a1.4 1.4 0 0 0-1.4-1.4m.4 2v-.6a.4.4 0 0 0-.4-.4h-3.2a.4.4 0 0 0-.4.4v.6z'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgTrash;

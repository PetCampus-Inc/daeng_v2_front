import * as React from 'react';
import type { SVGProps } from 'react';
const SvgList = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <rect width={24} height={24} y={0.5} fill='#EEE3D9' rx={4} />
    <path
      fill='#fff'
      d='M4.89 7.166c0-.981.797-1.777 1.778-1.777h10.667c.982 0 1.778.796 1.778 1.777v10.667c0 .982-.796 1.778-1.778 1.778H6.668a1.78 1.78 0 0 1-1.777-1.778z'
    />
    <path
      fill='#E4CAB1'
      fillRule='evenodd'
      d='M6.667 4.5h10.666A2.667 2.667 0 0 1 20 7.167v10.666a2.667 2.667 0 0 1-2.667 2.667H6.667A2.667 2.667 0 0 1 4 17.833V7.167A2.667 2.667 0 0 1 6.667 4.5m0 .889c-.982 0-1.778.796-1.778 1.778v10.666c0 .982.796 1.778 1.778 1.778h10.666c.982 0 1.778-.796 1.778-1.778V7.167c0-.982-.796-1.778-1.778-1.778z'
      clipRule='evenodd'
    />
    <path
      fill='#E9E9E9'
      d='M17.332 8.056v.889h-8v-.89zM17.332 10.723v.888h-8v-.888zM17.332 13.389v.889h-8v-.89zM17.332 16.056v.889h-8v-.89z'
    />
    <circle cx={7.112} cy={8.5} r={0.444} fill='#956F4C' />
    <circle cx={7.112} cy={11.167} r={0.444} fill='#956F4C' />
    <circle cx={7.112} cy={13.833} r={0.444} fill='#956F4C' />
    <circle cx={7.112} cy={16.5} r={0.444} fill='#956F4C' />
  </svg>
);
export default SvgList;

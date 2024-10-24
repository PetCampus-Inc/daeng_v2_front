import * as React from 'react';
import type { SVGProps } from 'react';
const SvgBone = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <g filter='url(#bone_svg__a)'>
      <path
        fill='#956F4C'
        fillRule='evenodd'
        d='M15.896 10.9a2 2 0 0 1 2-2H18a2 2 0 0 1 1.2 3.6 2 2 0 0 1-1.2 3.6h-.104a2 2 0 0 1-2-2H8.104a2 2 0 0 1-2 2H6a2 2 0 0 1-1.2-3.6A2 2 0 0 1 6 8.9h.104a2 2 0 0 1 2 2z'
        clipRule='evenodd'
      />
    </g>
    <defs>
      <filter
        id='bone_svg__a'
        width={16}
        height={7.2}
        x={4}
        y={8.899}
        colorInterpolationFilters='sRGB'
        filterUnits='userSpaceOnUse'
      >
        <feFlood floodOpacity={0} result='BackgroundImageFix' />
        <feBlend in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
        <feColorMatrix
          in='SourceAlpha'
          result='hardAlpha'
          values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
        />
        <feOffset dx={-1} />
        <feComposite in2='hardAlpha' k2={-1} k3={1} operator='arithmetic' />
        <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0' />
        <feBlend in2='shape' result='effect1_innerShadow_4672_168629' />
      </filter>
    </defs>
  </svg>
);
export default SvgBone;

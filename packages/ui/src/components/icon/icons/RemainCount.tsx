import * as React from 'react';
import type { SVGProps } from 'react';
const SvgRemainCount = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <rect
      width={1.906}
      height={8}
      x={11.047}
      y={12.5}
      fill='#525252'
      rx={0.953}
    />
    <rect width={14.906} height={8} x={4.547} y={6.047} fill='#EEE3D9' rx={2} />
    <g filter='url(#remain-count_svg__a)'>
      <path
        fill='#956F4C'
        fillRule='evenodd'
        d='M9.232 8.385a.923.923 0 0 0-.554 1.662.922.922 0 0 0 .554 1.662h.048c.51 0 .923-.413.923-.923H13.8c0 .51.413.923.923.923h.048a.923.923 0 0 0 .554-1.662.923.923 0 0 0-.554-1.662h-.048a.923.923 0 0 0-.923.923h-3.597a.923.923 0 0 0-.923-.923z'
        clipRule='evenodd'
      />
    </g>
    <path
      fill='#E4CAB1'
      d='M5.559 7.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0M17.316 7.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0'
    />
    <defs>
      <filter
        id='remain-count_svg__a'
        width={7.387}
        height={3.324}
        x={8.309}
        y={8.385}
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
        <feOffset dx={-0.4} />
        <feComposite in2='hardAlpha' k2={-1} k3={1} operator='arithmetic' />
        <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0' />
        <feBlend in2='shape' result='effect1_innerShadow_5206_103833' />
      </filter>
    </defs>
  </svg>
);
export default SvgRemainCount;

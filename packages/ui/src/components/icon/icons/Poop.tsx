import * as React from 'react';
import type { SVGProps } from 'react';
const SvgPoop = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <path
      fill='#E4CAB1'
      d='M3.2 15.115a1 1 0 0 1 .985-1.169h15.63a1 1 0 0 1 .985 1.169l-.684 4a1 1 0 0 1-.985.831H4.869a1 1 0 0 1-.985-.831z'
    />
    <path
      fill='#D9D9D9'
      d='M5.316 13.946h13.368l-.692-9.076a1 1 0 0 0-.997-.924h-9.99a1 1 0 0 0-.997.924z'
    />
    <path
      fill='#B5B5B5'
      d='M16 3.946H8l.402 7.057a1 1 0 0 0 .999.943h5.198a1 1 0 0 0 .999-.943z'
    />
    <path
      fill='#C8A584'
      d='M5 13.946h14l-.637 3.196a1 1 0 0 1-.981.804H6.618a1 1 0 0 1-.98-.804z'
    />
    <path
      fill='#E9E9E9'
      d='M3 14.446h18l-.013-1.013a1 1 0 0 0-1-.987H4.013a1 1 0 0 0-1 .987z'
    />
    <path
      fill='#956F4C'
      d='M3 14.446h18v.026a1 1 0 0 1-1 .974H4a1 1 0 0 1-1-.974zM14 17.946h-4l.127-1.113a1 1 0 0 1 .993-.887h1.76a1 1 0 0 1 .993.887z'
    />
    <g filter='url(#poop_svg__a)'>
      <path
        fill='#885D36'
        fillRule='evenodd'
        d='M13.132 8.831a1 1 0 0 1 .86 1.116H14a1 1 0 0 1 0 2h-4a1 1 0 1 1 0-2h.008A1 1 0 0 1 11 8.823h.262a.54.54 0 0 0 .396-.56l-.003-.04a.518.518 0 0 1 .948-.326L13 8.49a.85.85 0 0 1 .133.341'
        clipRule='evenodd'
      />
    </g>
    <defs>
      <filter
        id='poop_svg__a'
        width={6}
        height={4.28}
        x={9}
        y={7.666}
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
        <feOffset dx={-0.2} />
        <feComposite in2='hardAlpha' k2={-1} k3={1} operator='arithmetic' />
        <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0' />
        <feBlend in2='shape' result='effect1_innerShadow_4672_168720' />
      </filter>
    </defs>
  </svg>
);
export default SvgPoop;

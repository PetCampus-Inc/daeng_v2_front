import * as React from 'react';
import type { SVGProps } from 'react';
const SvgRegistration = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='1em'
    height='1em'
    fill='none'
    viewBox='0 0 24 25'
    {...props}
  >
    <rect width={24} height={24} y={0.5} fill='#FFF7E1' rx={12} />
    <path
      fill='#956F4C'
      d='M4.721 16.171A2 2 0 0 1 6.694 14.5h10.612a2 2 0 0 1 1.973 1.671l.333 2a2 2 0 0 1-1.973 2.329H6.361a2 2 0 0 1-1.973-2.329z'
    />
    <path
      fill='#E4CAB1'
      d='M7.686 7.43A4 4 0 0 1 11.54 4.5h.92a4 4 0 0 1 3.854 2.93l.277 1c.708 2.548-1.208 5.07-3.854 5.07h-1.474c-2.646 0-4.562-2.522-3.855-5.07z'
    />
    <path
      stroke='#C8A584'
      strokeLinecap='round'
      strokeWidth={0.4}
      d='M12 10.5c-.333.333-.5 1-1.5.5M12 10.5c.333.333.5 1 1.5.5'
    />
    <path
      fill='#956F4C'
      d='M11.095 9.738a.27.27 0 0 1 .27-.238h1.27c.137 0 .253.102.27.238a.678.678 0 0 1-.673.762h-.464a.678.678 0 0 1-.673-.762M7.725 5.649c.36-.41.962-.498 1.425-.21a.56.56 0 0 1 .251.586l-.558 2.687a1.531 1.531 0 1 1-2.649-1.323zM16.314 5.649a1.115 1.115 0 0 0-1.425-.21.56.56 0 0 0-.251.586l.558 2.687a1.531 1.531 0 1 0 2.649-1.323z'
    />
    <circle cx={17} cy={15.5} r={3} fill='#858585' />
    <path
      fill='#F7F7F7'
      fillRule='evenodd'
      d='M15.155 15.52c0 .207.167.374.373.374h1.12v1.12a.373.373 0 0 0 .747 0v-1.12h1.119a.373.373 0 0 0 0-.747h-1.12v-1.119a.373.373 0 0 0-.746 0v1.12h-1.12a.373.373 0 0 0-.373.373'
      clipRule='evenodd'
    />
  </svg>
);
export default SvgRegistration;

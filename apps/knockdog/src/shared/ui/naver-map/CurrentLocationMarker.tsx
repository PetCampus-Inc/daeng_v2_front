'use client';

import { Overlay } from '@knockdog/naver-map';
import { useCurrentLocation } from '@shared/lib/geolocation';

interface CurrentLocationMarkerProps {
  icon?: React.ReactNode;
  zIndex?: number;
}

export function CurrentLocationMarker({
  icon,
  zIndex = 0,
}: CurrentLocationMarkerProps) {
  const location = useCurrentLocation();

  const renderIcon = () => {
    if (icon) return icon;
    return (
      <svg
        width='44'
        height='44'
        viewBox='0 0 44 44'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle cx='22' cy='22' r='22' fill='#FF6E0C' fillOpacity='0.2' />
        <circle cx='22' cy='22' r='16' fill='#FF6E0C' />
        <path
          d='M20.4918 29.8631C20.9766 30.2683 21.4822 30.6386 21.9998 31C22.5185 30.6434 23.0217 30.2641 23.5078 29.8631C24.3182 29.1892 25.0809 28.4584 25.7902 27.6761C27.4254 25.8651 29.1998 23.2398 29.1998 20.2927C29.1998 19.335 29.0136 18.3867 28.6517 17.5019C28.2899 16.6171 27.7596 15.8132 27.091 15.136C26.4224 14.4588 25.6287 13.9216 24.7551 13.5551C23.8816 13.1886 22.9453 13 21.9998 13C21.0543 13 20.118 13.1886 19.2445 13.5551C18.3709 13.9216 17.5772 14.4588 16.9086 15.136C16.2401 15.8132 15.7097 16.6171 15.3479 17.5019C14.986 18.3867 14.7998 19.335 14.7998 20.2927C14.7998 23.2398 16.5742 25.8643 18.2094 27.6761C18.9187 28.4586 19.6814 29.1889 20.4918 29.8631ZM21.9998 22.9262C21.3102 22.9262 20.6489 22.6487 20.1613 22.1548C19.6737 21.661 19.3998 20.9911 19.3998 20.2927C19.3998 19.5943 19.6737 18.9244 20.1613 18.4306C20.6489 17.9367 21.3102 17.6592 21.9998 17.6592C22.6894 17.6592 23.3507 17.9367 23.8383 18.4306C24.3259 18.9244 24.5998 19.5943 24.5998 20.2927C24.5998 20.9911 24.3259 21.661 23.8383 22.1548C23.3507 22.6487 22.6894 22.9262 21.9998 22.9262Z'
          fill='white'
        />
      </svg>
    );
  };

  if (!location) return null;
  return (
    <Overlay
      id='current-location-marker'
      position={location}
      zIndex={zIndex}
      content={renderIcon()}
    />
  );
}

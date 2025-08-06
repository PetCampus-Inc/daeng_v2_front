import { useState } from 'react';
import { Icon } from '@knockdog/ui';
import { NaverMap as NaverMapComponent, Overlay } from '@knockdog/naver-map';
import { PlaceMarker } from '@features/place-info';

import { useCurrentLocation } from '@shared/lib/geolocation';

interface DogSchoolLocationMapProps {
  address: string;
}

export function DogSchoolLocationMap({ address }: DogSchoolLocationMapProps) {
  const currentLocation = useCurrentLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const overlays = [
    {
      id: '1',
      position: { lat: 37.622562, lng: 127.152109 },
      title: '웅신미켈란',
      distance: 1.2,
    },
    {
      id: '2',
      position: { lat: 37.623465, lng: 127.153074 },
      title: '총각네횟집다산점',
      distance: 1.4,
    },
    {
      id: '3',
      position: { lat: 37.623426, lng: 127.151928 },
      title: '빅파이브',
      distance: 1,
    },
  ];

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>위치</span>
      </div>
      <div className='mb-2 flex items-center gap-2'>
        <span className='body2-regular'>{address}</span>
        <Icon icon='Copy' className='h-5 w-5 text-[#70727C]' />
      </div>
      <div className='bg-primitive-neutral-50 h-[166px] rounded-lg'>
        {/* 지도 영역 */}
        {/* <NaverMapComponent
          center={currentLocation}
          className='relative h-full w-full'
        /> */}
      </div>
    </div>
  );
}

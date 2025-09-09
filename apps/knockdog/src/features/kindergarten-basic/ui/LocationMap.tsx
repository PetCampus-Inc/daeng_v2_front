'use client';

import { useRef } from 'react';

import { Icon } from '@knockdog/ui';

import { MapView } from '@features/map';
import { Coord } from '@entities/kindergarten';

interface LocationMapProps {
  address: string;
  coord: Coord;
}

const DEFAULT_MAP_ZOOM_LEVEL = 15;

export function LocationMap({ address, coord }: LocationMapProps) {
  const map = useRef<naver.maps.Map | null>(null);

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
        <MapView ref={map} current={coord} center={coord} zoom={DEFAULT_MAP_ZOOM_LEVEL} />
      </div>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { IconButton } from '@knockdog/ui';
import { Map, Marker } from '@knockdog/react-naver-map';
import { Coord } from '@entities/kindergarten';
import { useClipboardCopy } from '@shared/lib/device';
import { CurrentLocationMarker } from '@shared/ui/map';

interface LocationMapProps {
  address: string;
  coord: Coord;
}

const DEFAULT_MAP_ZOOM_LEVEL = 15;

export function LocationMap({ address = '', coord = { lat: 0, lng: 0 } }: LocationMapProps) {
  const map = useRef<naver.maps.Map | null>(null);
  const copy = useClipboardCopy();

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>위치</span>
      </div>
      <div className='mb-2 flex items-center gap-2'>
        <span className='body2-regular'>{address}</span>
        <IconButton icon='Copy' className='h-5 w-5 text-[#70727C]' onClick={async () => await copy(address)} />
      </div>

      <div className='bg-primitive-neutral-50 h-[166px] overflow-hidden rounded-lg'>
        <Map ref={map} center={coord} zoom={DEFAULT_MAP_ZOOM_LEVEL} className='h-full w-full'>
          <Marker
            position={coord}
            customIcon={{
              content: <CurrentLocationMarker />,
              align: 'center',
            }}
          />
        </Map>
      </div>
    </div>
  );
}

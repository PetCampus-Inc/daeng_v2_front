'use client';

import { useRef } from 'react';
import { IconButton } from '@knockdog/ui';
import { Map, Marker } from '@knockdog/react-naver-map';
import { Coord } from '@entities/kindergarten';
import { useClipboardCopy } from '@shared/lib/device';
import { CurrentLocationMarker } from '@shared/ui/map';
import { toast } from '@shared/ui/toast';

interface LocationMapProps {
  address: string;
  coord: Coord;
}

const DEFAULT_MAP_ZOOM_LEVEL = 15;

export function LocationMap({ address = '', coord = { lat: 0, lng: 0 } }: LocationMapProps) {
  const map = useRef<naver.maps.Map | null>(null);
  const copy = useClipboardCopy();

  const handleCopyAddress = async () => {
    if (!address) return;

    const isCopied = await copy(address);
    if (!isCopied) return;

    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: '주소를 복사했어요',
      titleParts: [
        { text: '주소', accent: true },
        { text: '를 복사했어요' },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>주소</span>
          <span className='body1-medium text-text-primary-inverse'>를 복사했어요</span>
        </>
      ),
    });
  };

  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>위치</span>
      </div>
      <div className='mb-2 flex items-center gap-2'>
        <span className='body2-regular'>{address}</span>
        <IconButton
          icon='Copy'
          aria-label='주소 복사'
          className='h-5 w-5 text-text-tertiary'
          onClick={handleCopyAddress}
        />
      </div>

      <div className='bg-primitive-neutral-50 h-[166px] overflow-hidden rounded-lg'>
        <Map ref={map} center={coord} zoom={DEFAULT_MAP_ZOOM_LEVEL} baseTileOpacity={0.88} className='h-full w-full'>
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

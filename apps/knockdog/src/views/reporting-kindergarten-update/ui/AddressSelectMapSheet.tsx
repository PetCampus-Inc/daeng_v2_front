'use client';

import { useRef, useState } from 'react';
import { ActionButton, Icon } from '@knockdog/ui';
import { Map, Overlay } from '@knockdog/react-naver-map';
import { CurrentSelectionMarker } from './CurrentSelectionMarker';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useCurrentAddress } from '@shared/lib';
import type { Coord } from '@shared/types';
import { SafeArea } from '@shared/ui/safe-area';

interface AddressSelectMapSheetProps {
  isOpen: boolean;
  close: () => void;
  defaultLocation: {
    lat: number;
    lng: number;
    name?: string;
  };
  onSelect: (location: { lat: number; lng: number; name: string }) => void;
}

const DEFAULT_MAP_ZOOM_LEVEL = 15;

export function AddressSelectMapSheet({ isOpen, close, defaultLocation, onSelect }: AddressSelectMapSheetProps) {
  const map = useRef<naver.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);

  const { primaryText, isLoading } = useCurrentAddress(selectedLocation);

  const handleMapClick = (coord: Coord) => {
    setSelectedLocation(coord);
  };

  const handleConfirm = () => {
    onSelect({
      ...selectedLocation,
      name: primaryText ?? defaultLocation.name ?? '',
    });
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal h-dvh max-h-dvh rounded-none' aria-label={'지도에서 선택하기'}>
        <SafeArea edges={['bottom', 'top']}>
          <BottomSheet.Header className='justify-center'>
            <BottomSheet.CloseButton />
            <BottomSheet.Title>지도에서 선택하기</BottomSheet.Title>
          </BottomSheet.Header>

          <div className='h-[calc(100dvh-304px)]'>
            <Map
              ref={map}
              center={defaultLocation}
              zoom={DEFAULT_MAP_ZOOM_LEVEL}
              className='h-full w-full'
              onClick={(e) => handleMapClick({ lat: e.coord.y, lng: e.coord.x })}
            >
              <Overlay position={selectedLocation}>
                <CurrentSelectionMarker />
              </Overlay>
            </Map>
          </div>

          <div>
            <div className='px-4' />
            <div className='flex items-center justify-center gap-x-1 px-4 py-3'>
              <Icon icon='LocationFill' />
              <span className='body1-bold'>
                {isLoading ? '주소 검색 중...' : (primaryText ?? defaultLocation.name)}
              </span>
            </div>
            <div className='px-4'>
              <ActionButton variant='secondaryFill' size='large' onClick={handleConfirm} disabled={isLoading}>
                <Icon icon='Plus' />
                확인
              </ActionButton>
            </div>
          </div>
        </SafeArea>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

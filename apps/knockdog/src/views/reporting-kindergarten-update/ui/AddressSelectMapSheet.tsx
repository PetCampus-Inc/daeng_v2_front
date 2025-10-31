'use client';

import { useRef, useState } from 'react';
import { BottomSheet, ActionButton, Icon } from '@knockdog/ui';
import { MapView } from '@features/map';
import { useCurrentAddress } from '@shared/lib';

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

  const handleMapClick = (coord: { lat: number; lng: number }) => {
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
      <BottomSheet.Body className='z-modal h-screen max-h-screen rounded-none' aria-label={'지도에서 선택하기'}>
        <BottomSheet.Header className='justify-center'>
          <BottomSheet.CloseButton />
          <BottomSheet.Title>지도에서 선택하기</BottomSheet.Title>
        </BottomSheet.Header>

        <div>
          <div className='h-[calc(100vh-184px)]'>
            <MapView
              ref={map}
              selection={selectedLocation}
              center={defaultLocation}
              zoom={DEFAULT_MAP_ZOOM_LEVEL}
              onClick={handleMapClick}
            />
          </div>

          <div>
            <div className='px-4'></div>
            <div className='flex items-center justify-center gap-x-1 px-4 py-3'>
              <Icon icon='Location' />
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
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

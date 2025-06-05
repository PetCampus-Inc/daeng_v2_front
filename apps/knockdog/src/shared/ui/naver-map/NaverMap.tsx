'use client';

import React, { useState } from 'react';

import { NaverMap as NaverMapComponent, Overlay } from '@knockdog/naver-map';
import { ExampleMapControlPanel } from './ExampleMapControlPanel';
import { CurrentLocationMarker } from './CurrentLocationMarker';

import { PlaceMarker } from '@features/place-info';
import { useCurrentLocation } from '@shared/lib/geolocation';

export const NaverMap = () => {
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
    <div className='relative mt-20'>
      <NaverMapComponent
        center={currentLocation}
        className='relative h-[500px] w-full'
        onClick={(e) => console.log('click', e)}
        onDragEnd={(e) => console.log('dragend', e)}
        onZoomChanged={(zoom) => console.log('zoomchanged', zoom)}
        onLoad={(map) => console.log('load', map)}
      >
        {/* 현재 위치 마커 */}
        <CurrentLocationMarker />

        {/* 장소 오버레이 */}
        {overlays.map((overlay) => {
          const isSelected = selected === overlay.id;

          return (
            <Overlay
              key={overlay.id}
              id={overlay.id}
              position={overlay.position}
              zIndex={isSelected ? 10 : undefined}
              direction='top'
              offset={{ y: 12 }}
              content={
                <PlaceMarker
                  title={overlay.title}
                  distance={overlay.distance}
                  selected={isSelected}
                  onClick={() => setSelected(overlay.id)}
                />
              }
            />
          );
        })}
      </NaverMapComponent>

      {/* 컨트롤 패널 예제 */}
      <ExampleMapControlPanel />
    </div>
  );
};

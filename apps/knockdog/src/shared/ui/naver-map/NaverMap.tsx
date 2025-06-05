'use client';

import React, { useState } from 'react';

import {
  NaverMap as NaverMapComponent,
  Overlay,
  CurrentLocationMarker,
} from '@knockdog/naver-map';

import { PlaceMarker } from '@features/place-info';
import { ExampleMapControlPanel } from './ExampleMapControlPanel';

// 테스트용 위치 데이터 - 다산신도시 주변 가까운 위치들
const testLocations = [
  {
    name: '다산신도시 중심',
    center: { lat: 37.623465, lng: 127.153074 },
  },
  {
    name: '다산신도시 북쪽 (500m)',
    center: { lat: 37.627965, lng: 127.153074 },
  },
  {
    name: '다산신도시 남쪽 (500m)',
    center: { lat: 37.618965, lng: 127.153074 },
  },
  {
    name: '다산신도시 동쪽 (500m)',
    center: { lat: 37.623465, lng: 127.159574 },
  },
  {
    name: '다산신도시 서쪽 (500m)',
    center: { lat: 37.623465, lng: 127.146574 },
  },
  {
    name: '다산신도시 북동쪽 (700m)',
    center: { lat: 37.627165, lng: 127.157774 },
  },
];

export const NaverMap = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [currentCenter, setCurrentCenter] = useState(
    testLocations[0]?.center ?? { lat: 37.623465, lng: 127.153074 }
  );
  const [currentLocationName, setCurrentLocationName] = useState(
    testLocations[0]?.name ?? '다산신도시'
  );

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

  const handleLocationChange = (location: (typeof testLocations)[0]) => {
    setCurrentCenter(location.center);
    setCurrentLocationName(location.name);
    console.log(`지도 중심점 변경: ${location.name}`, location.center);
  };

  return (
    <div className='mt-20'>
      {/* 테스트 컨트롤 패널 */}
      <div className='mb-4 rounded-lg bg-gray-100 p-4'>
        <h3 className='mb-2 text-lg font-bold'>지도 중심점 테스트</h3>
        <p className='mb-3 text-sm text-gray-600'>
          현재 위치:{' '}
          <span className='font-semibold text-blue-600'>
            {currentLocationName}
          </span>
        </p>
        <div className='flex flex-wrap gap-2'>
          {testLocations.map((location) => (
            <button
              key={location.name}
              onClick={() => handleLocationChange(location)}
              className={`rounded px-3 py-2 text-sm transition-colors ${
                currentLocationName === location.name
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>

      <NaverMapComponent
        center={currentCenter}
        className='relative h-[500px] w-full'
        currentCenter
        onClick={(e) => console.log('click', e)}
        onDragEnd={(e) => console.log('dragend', e)}
        onZoomChanged={(zoom) => console.log('zoomchanged', zoom)}
        // onLoad={(map) => console.log('load', map)}
      >
        {/* 현재 위치 마커 */}
        <CurrentLocationMarker />

        {/* 컨트롤 패널 예제 */}
        <ExampleMapControlPanel />

        {/* 장소 오버레이 */}
        {overlays.map((overlay) => {
          const isSelected = selected === overlay.id;

          return (
            <Overlay
              key={overlay.id}
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
    </div>
  );
};

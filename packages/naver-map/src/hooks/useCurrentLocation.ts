'use client';

import { useEffect, useState } from 'react';

export function useCurrentLocation() {
  const [position, setPosition] = useState<naver.maps.LatLng | undefined>(
    undefined
  );

  useEffect(() => {
    if (typeof naver === 'undefined')
      throw new Error(
        '네이버 지도 인스턴스가 초기화되지 않았습니다.\n> NaverMap 컴포넌트 내부에서 사용해 주세요.'
      );

    try {
      window.navigator.geolocation.getCurrentPosition((position) => {
        setPosition(
          new naver.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
        );
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return position;
}

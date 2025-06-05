'use client';

import { useRef } from 'react';

import { MapInstanceContext } from '../contexts';

interface NaverMapProviderProps {
  children: React.ReactNode;
}

export function NaverMapProvider({ children }: NaverMapProviderProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);

  return <MapInstanceContext value={mapRef}>{children}</MapInstanceContext>;
}

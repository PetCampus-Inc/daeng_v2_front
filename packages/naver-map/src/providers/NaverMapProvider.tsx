'use client';

import { MapInstanceContext } from '../contexts';
import { useRef } from 'react';

interface NaverMapProviderProps {
  children: React.ReactNode;
}

export function NaverMapProvider({ children }: NaverMapProviderProps) {
  const mapRef = useRef<naver.maps.Map | null>(null);

  return <MapInstanceContext value={mapRef}>{children}</MapInstanceContext>;
}

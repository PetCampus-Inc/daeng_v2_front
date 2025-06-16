'use client';

import { createContext, RefObject } from 'react';

type MapInstanceContextType = RefObject<naver.maps.Map | null>;
export const MapInstanceContext = createContext<MapInstanceContextType>({
  current: null,
});

import { createContext, ReactNode, useContext } from 'react';

type MapContextValue = naver.maps.Map | null;

const MapContext = createContext<MapContextValue>(null);

interface MapContextProviderProps {
  children: ReactNode;
  value: MapContextValue;
}

export const MapProvider = ({ children, value }: MapContextProviderProps) => {
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
  const map = useContext(MapContext);
  if (!map) throw new Error('map is not accessible');

  return map;
};

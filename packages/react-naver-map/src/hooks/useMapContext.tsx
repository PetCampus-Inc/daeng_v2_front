import { createContext, ReactNode, useContext } from 'react';

type MapContext = naver.maps.Map | null;

const MapContext = createContext<MapContext>(null);

interface MapContextProviderProps {
  children: ReactNode;
  value: MapContext;
}

export const MapProvider = ({ children, value }: MapContextProviderProps) => {
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
  const map = useContext(MapContext);
  if (!map) throw new Error('map is not accessible');

  return map;
};

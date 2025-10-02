import { useState, ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { dogSchoolListOptions, type DogSchoolWithMeta } from '@features/dog-school';
import { SidoGunguAggregation } from '@entities/dog-school/model/dogschool-list';
import { createSafeContext, useBasePoint } from '@shared/lib';

interface MapSnapshot {
  center: { lat?: number; lng?: number } | null;
  bounds: naver.maps.LatLngBounds | null;
  zoomLevel: number;
}

interface MapSearchContextValue {
  mapSnapshot: MapSnapshot;
  setMapSnapshot: (snapshot: MapSnapshot) => void;
  isMapLoaded: boolean;
  setIsMapLoaded: (loaded: boolean) => void;

  query: ReturnType<typeof useInfiniteQuery>;
  schoolList: DogSchoolWithMeta[];
  aggregations: SidoGunguAggregation[];
}

const [MapSearchContext, useMapSearch] = createSafeContext<MapSearchContextValue>('MapSearchContext');

export function MapSearchContextImpl({ children }: { children: ReactNode }) {
  const { coord: basePoint } = useBasePoint();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapSnapshot, setMapSnapshot] = useState<MapSnapshot>({
    center: null,
    bounds: null,
    zoomLevel: 0,
  });

  const query = useInfiniteQuery({
    ...dogSchoolListOptions.searchList({
      refPoint: basePoint!,
      bounds: mapSnapshot.bounds!,
      zoomLevel: mapSnapshot.zoomLevel,
    }),
  });

  const schoolList = query.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  const aggregations =
    query.data?.pages?.flatMap(
      (page) => page.aggregations.sidoAggregations ?? page.aggregations.sigunAggregations ?? []
    ) || [];

  return (
    <MapSearchContext
      value={{ mapSnapshot, setMapSnapshot, isMapLoaded, setIsMapLoaded, query, schoolList, aggregations }}
    >
      {children}
    </MapSearchContext>
  );
}

export { MapSearchContextImpl as MapSearchContext, useMapSearch };

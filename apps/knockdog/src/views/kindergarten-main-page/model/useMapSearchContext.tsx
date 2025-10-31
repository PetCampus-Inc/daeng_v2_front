import { useState, ReactNode } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { isAggregationZoom } from '@views/kindergarten-main-page/model/markers';
import { type DogSchoolWithMeta, kindergartenQueryOptions } from '@features/kindergarten';
import type { FilterOption, SidoGunguAggregation } from '@entities/kindergarten';

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

  schoolList: DogSchoolWithMeta[];
  aggregations: SidoGunguAggregation[];
}

const [MapSearchContext, useMapSearch] = createSafeContext<MapSearchContextValue>('MapSearchContext');

export function MapSearchContextImpl({ children, filters = [] }: { children: ReactNode; filters?: FilterOption[] }) {
  const { coord: basePoint } = useBasePoint();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapSnapshot, setMapSnapshot] = useState<MapSnapshot>({
    center: null,
    bounds: null,
    zoomLevel: 0,
  });

  // 업체 목록 쿼리
  const searchListQuery = useInfiniteQuery({
    ...kindergartenQueryOptions.searchList({
      refPoint: basePoint!,
      bounds: mapSnapshot.bounds!,
      zoomLevel: mapSnapshot.zoomLevel,
      filters,
    }),
  });

  const aggregationQuery = useQuery({
    ...kindergartenQueryOptions.aggregation({
      refPoint: basePoint!,
      bounds: mapSnapshot.bounds!,
      zoomLevel: mapSnapshot.zoomLevel,
      filters,
      enabled: isAggregationZoom(mapSnapshot.zoomLevel),
    }),
  });

  const schoolList = searchListQuery.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  const aggregations =
    aggregationQuery.data?.aggregations.sidoAggregations ?? aggregationQuery.data?.aggregations.sigunAggregations ?? [];

  return (
    <MapSearchContext value={{ mapSnapshot, setMapSnapshot, isMapLoaded, setIsMapLoaded, schoolList, aggregations }}>
      {children}
    </MapSearchContext>
  );
}

export { MapSearchContextImpl as MapSearchContext, useMapSearch };

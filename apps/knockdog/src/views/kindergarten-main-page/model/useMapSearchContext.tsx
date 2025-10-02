import { useState, ReactNode } from 'react';
import {
  type DogSchoolWithMeta,
  useKindergartenAggregationQuery,
  useKindergartenSearchListQuery,
} from '@features/kindergarten';
import type { SidoGunguAggregation } from '@entities/kindergarten';

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

export function MapSearchContextImpl({ children }: { children: ReactNode }) {
  const { coord: basePoint } = useBasePoint();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapSnapshot, setMapSnapshot] = useState<MapSnapshot>({
    center: null,
    bounds: null,
    zoomLevel: 0,
  });

  const searchListQuery = useKindergartenSearchListQuery({
    refPoint: basePoint!,
    bounds: mapSnapshot.bounds!,
    zoomLevel: mapSnapshot.zoomLevel,
  });

  const aggregationQuery = useKindergartenAggregationQuery({
    refPoint: basePoint!,
    bounds: mapSnapshot.bounds!,
    zoomLevel: mapSnapshot.zoomLevel,
  });

  const schoolList = searchListQuery.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  const aggregations = aggregationQuery.data?.sidoAggregations ?? aggregationQuery.data?.sigunAggregations ?? [];

  return (
    <MapSearchContext value={{ mapSnapshot, setMapSnapshot, isMapLoaded, setIsMapLoaded, schoolList, aggregations }}>
      {children}
    </MapSearchContext>
  );
}

export { MapSearchContextImpl as MapSearchContext, useMapSearch };

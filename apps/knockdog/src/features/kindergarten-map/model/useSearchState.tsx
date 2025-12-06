import {
  type BoundsSnapshot,
  type MapSnapshot,
  type RegionLevel,
  type SearchEvent,
  type SearchSnapshot,
  searchSnapshotReducer,
} from '../lib/searchState';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { normalizeSnapshotForUrl, useSearchSnapshotUrlState } from './useSearchSnapshotUrlState';
import { getRegionLevel } from '../lib/markers';
import type { FilterOption } from '@entities/kindergarten';
import { useBasePoint } from '@shared/lib';
import type { Coord } from '@shared/types';

interface SearchStateContextValue {
  snapshot: SearchSnapshot;
  mapSnapshot: MapSnapshot;
  dispatch: (event: SearchEvent) => void;
  mapChange: (mapSnapshot: MapSnapshot) => void;
  enter: () => void;
  setQuery: (query: string) => void;
  setFilters: (filters: FilterOption[]) => void;
  clearQuery: () => void;
  clearFilters: () => void;
  zoomLevelChange: (params: {
    prevLevel: RegionLevel;
    nextLevel: RegionLevel;
    viewportBounds: BoundsSnapshot | null;
  }) => void;
  aggMarkerClick: (bounds: BoundsSnapshot) => void;
  researchHere: (params: { viewportBounds: BoundsSnapshot | null; levelFromZoom: RegionLevel }) => void;
}

const SearchStateContext = createContext<SearchStateContextValue | null>(null);

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const { coord: basePoint } = useBasePoint();
  const [mapSnapshot, setMapSnapshot] = useState<MapSnapshot>({
    center: null,
    zoom: 0,
    viewportBounds: null,
  });
  /**
   * reducer에 전달할 최신 mapSnapshot을 보존하기 위해 ref를 사용한다.
   * applyEvent는 deps 최적화를 위해 mapSnapshot을 의존성에 넣지 않으므로,
   * 이벤트 시점의 실시간 viewport/zoom 정보를 잃지 않도록 ref에 동기화한다.
   */
  const mapSnapshotRef = useRef<MapSnapshot>(mapSnapshot);
  useEffect(() => {
    mapSnapshotRef.current = mapSnapshot;
  }, [mapSnapshot]);

  const {
    scope,
    searchedLevel,
    query,
    filters,
    refPoint,
    bounds,
    searchLock,
    setScope,
    setSearchedLevel,
    setQuery: setSnapshotQuery,
    setFilters: setSnapshotFilters,
    setRefPoint,
    setBounds,
    setSearchLock,
  } = useSearchSnapshotUrlState();

  const snapshot: SearchSnapshot = useMemo(
    () => ({
      scope,
      searchedLevel,
      query,
      filters,
      refPoint,
      searchBounds: bounds,
      searchLock,
    }),
    [scope, searchedLevel, query, filters, refPoint, bounds, searchLock]
  );

  const resolveRefPoint = useCallback(
    (fallback: Coord | null = null): Coord | null => {
      if (basePoint) {
        return basePoint;
      }
      return fallback;
    },
    [basePoint]
  );

  const applyEvent = useCallback(
    (event: SearchEvent, mapSnapshotOverride?: MapSnapshot) => {
      const effectiveMapSnapshot = mapSnapshotOverride ?? mapSnapshotRef.current;
      const prev = snapshot;

      const nextRaw = searchSnapshotReducer(prev, event, {
        mapSnapshot: effectiveMapSnapshot,
        regionLevelFromZoom: getRegionLevel(effectiveMapSnapshot.zoom ?? prev.searchedLevel),
        refPointFromBase: resolveRefPoint(prev.refPoint),
      });

      const next = normalizeSnapshotForUrl(nextRaw);

      if (next.scope !== prev.scope) {
        setScope(next.scope);
      }

      if (next.searchedLevel !== prev.searchedLevel) {
        setSearchedLevel(next.searchedLevel);
      }

      if (next.query !== prev.query) {
        setSnapshotQuery(next.query);
      }

      if (!areFilterArraysEqual(next.filters, prev.filters)) {
        setSnapshotFilters(next.filters);
      }

      if (!areCoordsEqual(next.refPoint, prev.refPoint)) {
        setRefPoint(next.refPoint);
      }

      if (!areBoundsEqual(next.searchBounds, prev.searchBounds)) {
        setBounds(next.searchBounds);
      }

      if (next.searchLock !== prev.searchLock) {
        setSearchLock(next.searchLock);
      }
    },
    [
      resolveRefPoint,
      setBounds,
      setSnapshotFilters,
      setSnapshotQuery,
      setRefPoint,
      setScope,
      setSearchedLevel,
      setSearchLock,
      snapshot,
    ]
  );

  const dispatch = useCallback(
    (event: SearchEvent) => {
      applyEvent(event);
    },
    [applyEvent]
  );

  const mapChange = useCallback(
    (nextSnapshot: MapSnapshot) => {
      setMapSnapshot(nextSnapshot);
      applyEvent(
        {
          type: 'MAP_CHANGE',
          mapSnapshot: nextSnapshot,
        },
        nextSnapshot
      );
    },
    [applyEvent]
  );

  const enter = useCallback(() => {
    applyEvent({ type: 'ENTER' });
  }, [applyEvent]);

  const setQuery = useCallback(
    (query: string) => {
      applyEvent({ type: 'SET_QUERY', query });
    },
    [applyEvent]
  );

  const setFilters = useCallback(
    (filters: FilterOption[]) => {
      applyEvent({ type: 'SET_FILTERS', filters });
    },
    [applyEvent]
  );

  const clearQuery = useCallback(() => {
    applyEvent({ type: 'CLEAR_QUERY' });
  }, [applyEvent]);

  const clearFilters = useCallback(() => {
    applyEvent({ type: 'CLEAR_FILTERS' });
  }, [applyEvent]);

  const zoomLevelChange = useCallback(
    (params: { prevLevel: RegionLevel; nextLevel: RegionLevel; viewportBounds: BoundsSnapshot | null }) => {
      applyEvent({
        type: 'ZOOM_LEVEL_CHANGE',
        prevLevel: params.prevLevel,
        nextLevel: params.nextLevel,
        viewportBounds: params.viewportBounds,
      });
    },
    [applyEvent]
  );

  const aggMarkerClick = useCallback(
    (bounds: BoundsSnapshot) => {
      applyEvent({ type: 'AGG_MARKER_CLICK', bounds });
    },
    [applyEvent]
  );

  const researchHere = useCallback(
    (params: { viewportBounds: BoundsSnapshot | null; levelFromZoom: RegionLevel }) => {
      applyEvent({
        type: 'RESEARCH_HERE',
        viewportBounds: params.viewportBounds,
        levelFromZoom: params.levelFromZoom,
      });
    },
    [applyEvent]
  );

  const value = useMemo<SearchStateContextValue>(
    () => ({
      dispatch,
      snapshot,
      mapSnapshot,
      mapChange,
      enter,
      setQuery,
      setFilters,
      clearQuery,
      clearFilters,
      zoomLevelChange,
      aggMarkerClick,
      researchHere,
    }),
    [
      dispatch,
      snapshot,
      mapSnapshot,
      mapChange,
      enter,
      setQuery,
      setFilters,
      clearQuery,
      clearFilters,
      zoomLevelChange,
      aggMarkerClick,
      researchHere,
    ]
  );

  return <SearchStateContext.Provider value={value}>{children}</SearchStateContext.Provider>;
}

export function useSearchState(): SearchStateContextValue {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState는 SearchStateProvider 하위에서만 사용할 수 있습니다.');
  }
  return context;
}

function areCoordsEqual(a: Coord | null, b: Coord | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.lat === b.lat && a.lng === b.lng;
}

export function areBoundsEqual(a: BoundsSnapshot | null, b: BoundsSnapshot | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.swLat === b.swLat && a.swLng === b.swLng && a.neLat === b.neLat && a.neLng === b.neLng;
}

function areFilterArraysEqual(a: FilterOption[], b: FilterOption[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchState } from './useSearchState';
import { kindergartenQueryOptions } from '@entities/kindergarten/api/map-search-query';
import { useBasePoint } from '@shared/lib';
import type {
  Aggregation,
  KindergartenListItemWithMeta,
  KindergartenListWithMeta,
  SortType,
  SidoGunguAggregation,
} from '@entities/kindergarten';
import type { Coord } from '@shared/types';
import type {
  KindergartenSearchSnapshotLike,
  KindergartenMapSnapshotLike,
} from '@entities/kindergarten/api/map-search-query';
import { boundsSnapshotToBounds } from '../lib/bounds';
import type { MapSnapshot } from '../lib/searchState';

interface UseSearchListQueryParams {
  rank?: SortType;
}

export function useSearchListQuery({ rank }: UseSearchListQueryParams = {}) {
  const { coord: basePoint } = useBasePoint();
  const { snapshot, mapSnapshot } = useSearchState();

  // 전역 검색이라도 L1(전국)일 때만 zoom 9로 강제, 그 외에는 실제 줌을 사용한다.
  const effectiveZoom = snapshot.scope === 'global' ? 9 : mapSnapshot.zoom;

  const snapshotLike: KindergartenSearchSnapshotLike = {
    scope: snapshot.scope,
    searchedLevel: snapshot.searchedLevel,
    query: snapshot.query,
    filters: snapshot.filters,
    refPoint: resolveRefPoint({
      snapshot,
      basePoint: basePoint ?? null,
      mapSnapshot,
    }),
    searchBounds: boundsSnapshotToBounds(snapshot.searchBounds),
    searchLock: snapshot.searchLock,
  };

  const searchListOptions = kindergartenQueryOptions.searchList({
    snapshot: snapshotLike,
    mapSnapshot: toMapSnapshotLike(mapSnapshot, effectiveZoom),
    rank,
  });
  const canFetchList = searchListOptions.enabled && mapSnapshot.center !== null;

  const searchListQuery = useInfiniteQuery({
    ...searchListOptions,
    enabled: canFetchList,
  });

  const listData = searchListQuery.data as InfiniteData<KindergartenListWithMeta> | undefined;

  const { searchList, exact, listWithoutExact } = useMemo(() => {
    if (!listData) {
      return {
        searchList: [] as KindergartenListItemWithMeta[],
        exact: null,
        listWithoutExact: [] as KindergartenListItemWithMeta[],
      };
    }
    const allList = listData.pages.flatMap((page) => page.schoolResult.list);
    const pageWithExact = listData.pages.find((page) => page.schoolResult.exact);
    const exactItem = pageWithExact?.schoolResult.exact ?? null;
    const listExceptExact = exactItem ? allList.filter((item) => item.id !== exactItem.id) : allList;
    return { searchList: allList, exact: exactItem, listWithoutExact: listExceptExact };
  }, [listData]);

  return {
    listQuery: searchListQuery,
    searchList,
    listWithoutExact,
    exact,
    isLoading: searchListQuery.isLoading,
    isFetching: searchListQuery.isFetching,
  };
}

export function useAggregationQuery() {
  const { coord: basePoint } = useBasePoint();
  const { snapshot, mapSnapshot } = useSearchState();

  const effectiveZoom = snapshot.scope === 'global' && snapshot.searchedLevel === 1 ? 9 : mapSnapshot.zoom;

  const snapshotLike: KindergartenSearchSnapshotLike = {
    scope: snapshot.scope,
    searchedLevel: snapshot.searchedLevel,
    query: snapshot.query,
    filters: snapshot.filters,
    refPoint: resolveRefPoint({
      snapshot,
      basePoint: basePoint ?? null,
      mapSnapshot,
    }),
    searchBounds: boundsSnapshotToBounds(snapshot.searchBounds),
    searchLock: snapshot.searchLock,
  };

  const aggregationOptions = kindergartenQueryOptions.aggregation({
    snapshot: snapshotLike,
    mapSnapshot: toMapSnapshotLike(mapSnapshot, effectiveZoom),
  });
  const canFetchAgg = aggregationOptions.enabled && mapSnapshot.center !== null;

  const aggregationQuery = useQuery({
    ...aggregationOptions,
    enabled: canFetchAgg,
  });

  const aggData = aggregationQuery.data as Aggregation | undefined;

  const aggregation = useMemo<SidoGunguAggregation[]>(() => {
    if (!aggData?.aggregations) return [];
    const { sidoAggregations, sigunAggregations } = aggData.aggregations;
    return sigunAggregations || sidoAggregations || [];
  }, [aggData]);

  const geoBounds = useMemo(() => {
    return aggData?.bounds || null;
  }, [aggData]);

  return {
    aggregation,
    geoBounds,
    isLoading: aggregationQuery.isLoading,
    isFetching: aggregationQuery.isFetching,
  };
}

function resolveRefPoint({
  snapshot,
  basePoint,
  mapSnapshot,
}: {
  snapshot: { scope: string; refPoint: Coord | null };
  basePoint: Coord | null;
  mapSnapshot: MapSnapshot;
}): Coord | null {
  if (snapshot.scope === 'nearby') {
    return snapshot.refPoint ?? basePoint ?? mapSnapshot.center ?? null;
  }

  return basePoint ?? mapSnapshot.center ?? snapshot.refPoint ?? null;
}

function toMapSnapshotLike(mapSnapshot: MapSnapshot, zoomOverride?: number): KindergartenMapSnapshotLike {
  return {
    center: mapSnapshot.center,
    zoom: zoomOverride ?? mapSnapshot.zoom,
  };
}

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useMapUrlState } from './useMapUrlState';
// FIXME: fsd import rule 위반! 수정이 필요함..
import { kindergartenQueryOptions, useSearchUrlState } from '@features/kindergarten-list';
import { useBasePoint } from '@shared/lib';
import type { Coord } from '@shared/types';

interface UseMapOverlayDataParams {
  mapSnapshot: {
    center: Partial<Coord> | null;
    bounds: naver.maps.LatLngBounds | null;
    zoomLevel: number;
  };
}

export function useSearchListQuery(params: UseMapOverlayDataParams) {
  const { coord: basePoint } = useBasePoint();
  const { query, filters, rank } = useSearchUrlState();
  const { searchMode } = useMapUrlState();

  const searchListQuery = useInfiniteQuery({
    ...kindergartenQueryOptions.searchList({
      refPoint: basePoint,
      bounds: params.mapSnapshot.bounds,
      zoomLevel: params.mapSnapshot.zoomLevel,
      filters,
      query,
      rank,
      searchMode,
    }),
  });

  const searchList = useMemo(() => {
    return searchListQuery.data?.pages?.flatMap((page) => page.schoolResult.list) || [];
  }, [searchListQuery.data]);

  return {
    searchList,
    isLoading: searchListQuery.isLoading,
    isFetching: searchListQuery.isFetching,
  };
}

interface UseAggregationQueryParams {
  mapSnapshot: {
    center: Partial<Coord> | null;
    bounds: naver.maps.LatLngBounds | null;
    zoomLevel: number;
  };
}

export function useAggregationQuery(params: UseAggregationQueryParams) {
  const { coord: basePoint } = useBasePoint();
  const { query, filters } = useSearchUrlState();
  const { searchMode } = useMapUrlState();

  const aggregationQuery = useQuery({
    ...kindergartenQueryOptions.aggregation({
      refPoint: basePoint,
      bounds: params.mapSnapshot.bounds,
      zoomLevel: params.mapSnapshot.zoomLevel,
      filters,
      query,
      searchMode,
    }),
  });

  const aggregation = useMemo(() => {
    if (!aggregationQuery.data?.aggregations) return [];
    const { sidoAggregations, sigunAggregations } = aggregationQuery.data.aggregations;
    return sigunAggregations || sidoAggregations || [];
  }, [aggregationQuery.data]);

  const geoBounds = useMemo(() => {
    return aggregationQuery.data?.bounds || null;
  }, [aggregationQuery.data]);

  return {
    aggregation,
    geoBounds,
    isLoading: aggregationQuery.isLoading,
    isFetching: aggregationQuery.isFetching,
  };
}

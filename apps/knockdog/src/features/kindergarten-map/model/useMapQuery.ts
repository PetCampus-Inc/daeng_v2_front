import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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

export function useMapQuery(params: UseMapOverlayDataParams) {
  const { coord: basePoint } = useBasePoint();
  const { query, filters, rank } = useSearchUrlState();

  const searchListQuery = useInfiniteQuery({
    ...kindergartenQueryOptions.searchList({
      refPoint: basePoint,
      bounds: params.mapSnapshot.bounds,
      zoomLevel: params.mapSnapshot.zoomLevel,
      filters,
      query,
      rank,
    }),
  });

  const searchList = useMemo(() => {
    const list = searchListQuery.data?.pages?.flatMap((page) => page.schoolResult.list) || [];
    return list.map((item) => ({
      id: item.id,
      coord: item.coord,
      title: item.title,
      dist: item.dist,
    }));
  }, [searchListQuery.data]);

  return {
    searchList,
    isLoading: searchListQuery.isLoading,
    isFetching: searchListQuery.isFetching,
  };
}

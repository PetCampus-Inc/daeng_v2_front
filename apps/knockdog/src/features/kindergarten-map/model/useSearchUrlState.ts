import { useCallback, useMemo } from 'react';
import { createParser, useQueryStates } from 'nuqs';
import type { BoundsSnapshot, SearchState, SearchUrlStateInput } from '../lib/searchMachine';
import type { RegionLevel, SearchScope } from '../config/map';
import type { FilterOption } from '@entities/kindergarten';
import { FILTER_OPTIONS } from '@entities/kindergarten';
import type { Coord } from '@shared/types';

type SearchLock = 0 | 1;

export type SearchUrlState = SearchUrlStateInput;

const isSearchScope = (value: string): value is SearchScope => {
  return value === 'nearby' || value === 'global' || value === 'bounds';
};

const SCOPE_PARSER = createParser<SearchScope | null>({
  parse: (value: string) => {
    if (!value || !isSearchScope(value)) return null;
    return value;
  },
  serialize: (value) => {
    // null이면 빈 문자열 반환 (URL에서 제거)
    // 빈 문자열이면 URL에서 제거되므로, 실제 값이 있을 때만 반환
    if (!value) return '';
    return value;
  },
});

const SEARCHED_LEVEL_PARSER = createParser<RegionLevel | null>({
  parse: (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
    return null;
  },
  serialize: (value) => (value ? String(value) : ''),
});

const isFilterOption = (value: string): value is FilterOption => {
  return Object.prototype.hasOwnProperty.call(FILTER_OPTIONS, value);
};

const FILTERS_PARSER = createParser<FilterOption[] | null>({
  parse: (value: string) => {
    if (!value) return null;
    const parsed = value.split(',').filter(isFilterOption);
    return parsed.length > 0 ? parsed : null;
  },
  serialize: (value) => (value?.length ? value.join(',') : ''),
});

const QUERY_PARSER = createParser<string | null>({
  parse: (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  },
  serialize: (value) => value || '',
});

const COORD_PARSER = createParser<Coord | null>({
  parse: (value: string) => {
    if (!value) return null;
    const [latRaw, lngRaw] = value.split(',');
    const lat = Number.parseFloat(latRaw ?? '');
    const lng = Number.parseFloat(lngRaw ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  },
  serialize: (value: Coord | null) => (value ? `${value.lat},${value.lng}` : ''),
});

const BOUNDS_PARSER = createParser<BoundsSnapshot | null>({
  parse: (value: string) => {
    if (!value) return null;
    const [swLatRaw, swLngRaw, neLatRaw, neLngRaw] = value.split(',');
    const swLat = Number.parseFloat(swLatRaw ?? '');
    const swLng = Number.parseFloat(swLngRaw ?? '');
    const neLat = Number.parseFloat(neLatRaw ?? '');
    const neLng = Number.parseFloat(neLngRaw ?? '');

    if (!Number.isFinite(swLat) || !Number.isFinite(swLng) || !Number.isFinite(neLat) || !Number.isFinite(neLng)) {
      return null;
    }

    return {
      swLat,
      swLng,
      neLat,
      neLng,
    };
  },
  serialize: (value: BoundsSnapshot | null) =>
    value ? `${value.swLat},${value.swLng},${value.neLat},${value.neLng}` : '',
});

const SEARCH_LOCK_PARSER = createParser<SearchLock | null>({
  parse: (value: string) => {
    if (value === '1') return 1;
    if (value === '0') return 0;
    return null;
  },
  serialize: (value) => (value === 1 ? '1' : '0'),
});

const ZOOM_PARSER = createParser<number | null>({
  parse: (value: string) => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  },
  serialize: (value) => (value != null ? String(value) : ''),
});

/**
 * SearchState(통합 검색상태) URL 상태를 관리하는 훅
 *
 * 관리하는 URL 파라미터:
 * - scope, searchedLevel, query, filters, refPoint, bounds, searchLock
 * - center, zoom
 */
export function useSearchUrlState() {
  const [urlState, setUrlState] = useQueryStates({
    // 검색 상태
    scope: SCOPE_PARSER,
    searchedLevel: SEARCHED_LEVEL_PARSER,
    query: QUERY_PARSER,
    filters: FILTERS_PARSER,
    refPoint: COORD_PARSER,
    bounds: BOUNDS_PARSER,
    searchLock: SEARCH_LOCK_PARSER,
    searchCenter: COORD_PARSER,
    // 지도 상태
    center: COORD_PARSER,
    zoom: ZOOM_PARSER,
  });

  const setState = useCallback(
    (nextState: SearchState) => {
      const updatePayload = {
        scope: nextState.scope,
        searchedLevel: nextState.searchedLevel,
        query: nextState.query,
        filters: nextState.filters.length > 0 ? nextState.filters : null,
        refPoint: nextState.refPoint,
        bounds: nextState.searchBounds,
        searchLock: nextState.searchLock,
        searchCenter: nextState.searchCenter,
        center: nextState.center,
        zoom: nextState.zoom,
      };

      return setUrlState(updatePayload);
    },
    [setUrlState]
  );

  const searchUrlState = useMemo(
    () => ({
      scope: urlState.scope,
      searchedLevel: urlState.searchedLevel,
      query: urlState.query,
      filters: urlState.filters,
      refPoint: urlState.refPoint,
      bounds: urlState.bounds,
      searchLock: urlState.searchLock,
      searchCenter: urlState.searchCenter,
    }),
    [
      urlState.scope,
      urlState.searchedLevel,
      urlState.query,
      urlState.filters,
      urlState.refPoint,
      urlState.bounds,
      urlState.searchLock,
      urlState.searchCenter,
    ]
  );

  // 지도 UI 관련 파라미터는 map 전용으로 분리한다.
  const mapUrlState = useMemo(
    () => ({
      center: urlState.center,
      zoom: urlState.zoom,
    }),
    [urlState.center, urlState.zoom]
  );

  return {
    urlState,
    searchUrlState,
    mapUrlState,
    setUrlState: setState,
  };
}

import { useCallback, useMemo } from 'react';
import { createParser, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type { BoundsSnapshot, SearchState } from '../lib/searchMachine';
import type { Coord } from '@shared/types';
import type { FilterOption } from '@entities/kindergarten';
import { FILTER_OPTIONS } from '@entities/kindergarten';
import { DEFAULT_MAP_ZOOM_LEVEL, type RegionLevel, type SearchScope } from '../config/map';

type SearchLock = 0 | 1;

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

const SEARCHED_LEVEL_PARSER = createParser<RegionLevel>({
  parse: (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
    return 1;
  },
  serialize: (value) => String(value),
});

const isFilterOption = (value: string): value is FilterOption => {
  return Object.prototype.hasOwnProperty.call(FILTER_OPTIONS, value);
};

const FILTERS_PARSER = createParser<FilterOption[]>({
  parse: (value: string) => {
    if (!value) return [];
    return value.split(',').filter(isFilterOption);
  },
  serialize: (value) => value.join(','),
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

const SEARCH_LOCK_PARSER = createParser<SearchLock>({
  parse: (value: string) => {
    return value === '1' ? 1 : 0;
  },
  serialize: (value) => (value === 1 ? '1' : '0'),
});

/**
 * SearchState(통합 검색상태) URL 상태를 관리하는 훅
 *
 * @description
 * ✅ useQueryStates를 사용하여 모든 검색/지도 관련 URL 파라미터를 한 번에 관리
 * - 여러 파라미터 동시 업데이트 시 배칭 처리로 URL 업데이트 1회만 발생
 *
 * 관리하는 URL 파라미터:
 * - scope, searchedLevel, query, filters, refPoint, bounds, searchLock
 * - center, zoom
 */
export function useSearchUrlState() {
  const [urlState, setUrlState] = useQueryStates({
    // 검색 상태
    scope: SCOPE_PARSER,
    searchedLevel: SEARCHED_LEVEL_PARSER.withDefault(3),
    query: parseAsString.withDefault(''),
    filters: FILTERS_PARSER.withDefault([]),
    refPoint: COORD_PARSER,
    bounds: BOUNDS_PARSER,
    searchLock: SEARCH_LOCK_PARSER.withDefault(0),
    searchCenter: COORD_PARSER,
    // 지도 상태
    center: COORD_PARSER,
    zoom: parseAsInteger.withDefault(DEFAULT_MAP_ZOOM_LEVEL),
  });

  /**
   * SearchState 전체를 한 번에 커밋 (배칭)
   *
   * @description
   * FSM 전이 결과를 URL에 원자적으로 반영합니다.
   *
   * @param nextState - 커밋할 SearchState
   */
  const commitState = useCallback(
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

      const promise = setUrlState(updatePayload);

      return promise.then((search) => {
        // nuqs의 Promise resolve 시점의 search가 빈 경우가 있거나,
        // 일부 값이 누락될 수 있으므로 updatePayload에서 직접 URLSearchParams를 구성
        const expectedSearchParams = new URLSearchParams();

        // updatePayload의 각 값을 직접 serialize하여 URLSearchParams 구성
        if (updatePayload.scope !== null && updatePayload.scope !== undefined) {
          const serialized = SCOPE_PARSER.serialize(updatePayload.scope);
          if (serialized) expectedSearchParams.set('scope', serialized);
        }
        if (updatePayload.searchedLevel !== null && updatePayload.searchedLevel !== undefined) {
          expectedSearchParams.set('searchedLevel', String(updatePayload.searchedLevel));
        }
        if (updatePayload.query !== null && updatePayload.query !== undefined && updatePayload.query !== '') {
          expectedSearchParams.set('query', updatePayload.query);
        }
        if (
          updatePayload.filters !== null &&
          Array.isArray(updatePayload.filters) &&
          updatePayload.filters.length > 0
        ) {
          expectedSearchParams.set('filters', updatePayload.filters.join(','));
        }
        if (updatePayload.refPoint !== null && updatePayload.refPoint !== undefined) {
          const serialized = COORD_PARSER.serialize(updatePayload.refPoint);
          if (serialized) expectedSearchParams.set('refPoint', serialized);
        }
        if (updatePayload.bounds !== null && updatePayload.bounds !== undefined) {
          const serialized = BOUNDS_PARSER.serialize(updatePayload.bounds);
          if (serialized) expectedSearchParams.set('bounds', serialized);
        }
        if (
          updatePayload.searchLock !== null &&
          updatePayload.searchLock !== undefined &&
          updatePayload.searchLock !== 0
        ) {
          expectedSearchParams.set('searchLock', '1');
        }
        if (updatePayload.searchCenter !== null && updatePayload.searchCenter !== undefined) {
          const serialized = COORD_PARSER.serialize(updatePayload.searchCenter);
          if (serialized) expectedSearchParams.set('searchCenter', serialized);
        }
        if (updatePayload.center !== null && updatePayload.center !== undefined) {
          const serialized = COORD_PARSER.serialize(updatePayload.center);
          if (serialized) expectedSearchParams.set('center', serialized);
        }
        if (
          updatePayload.zoom !== null &&
          updatePayload.zoom !== undefined &&
          updatePayload.zoom !== DEFAULT_MAP_ZOOM_LEVEL
        ) {
          expectedSearchParams.set('zoom', String(updatePayload.zoom));
        }

        // nuqs가 실제 URL을 업데이트하지 않는 경우를 대비하여
        // requestAnimationFrame으로 지연 후 실제 URL을 확인하고 필요시 직접 업데이트
        return new Promise<URLSearchParams>((resolve) => {
          requestAnimationFrame(() => {
            if (typeof window === 'undefined') {
              resolve(expectedSearchParams);
              return;
            }

            const actualSearchParams = new URLSearchParams(window.location.search);

            // nuqs가 관리하는 파라미터들만 확인 (다른 시스템에서 관리하는 파라미터는 무시)
            const nuqsParams = [
              'scope',
              'searchedLevel',
              'query',
              'filters',
              'refPoint',
              'bounds',
              'searchLock',
              'searchCenter',
              'center',
              'zoom',
            ];
            let needsUpdate = false;
            const mismatches: string[] = [];

            for (const key of nuqsParams) {
              const expected = expectedSearchParams.get(key);
              const actual = actualSearchParams.get(key);

              // null/undefined 처리를 위해 문자열로 비교
              const expectedStr = expected ?? '';
              const actualStr = actual ?? '';

              if (expectedStr !== actualStr) {
                needsUpdate = true;
                mismatches.push(`${key}: expected "${expectedStr}", actual "${actualStr}"`);
              }
            }

            if (needsUpdate) {
              // 현재 URL의 다른 파라미터들을 보존하면서 nuqs 파라미터만 업데이트
              const currentUrl = new URL(window.location.href);
              const newSearchParams = new URLSearchParams(currentUrl.search);

              // nuqs 파라미터들을 expectedSearchParams로 교체
              for (const key of nuqsParams) {
                const expectedValue = expectedSearchParams.get(key);
                if (expectedValue !== null) {
                  newSearchParams.set(key, expectedValue);
                } else {
                  newSearchParams.delete(key);
                }
              }

              currentUrl.search = newSearchParams.toString();
              window.history.replaceState(null, '', currentUrl.toString());
            }

            resolve(expectedSearchParams);
          });
        });
      });
    },
    [setUrlState]
  );

  const state: SearchState = useMemo(
    () => ({
      scope: urlState.scope ?? 'nearby',
      searchedLevel: urlState.searchedLevel,
      query: urlState.query,
      filters: urlState.filters,
      refPoint: urlState.refPoint,
      searchBounds: urlState.bounds,
      searchLock: urlState.searchLock,
      searchCenter: urlState.searchCenter,
      center: urlState.center,
      zoom: urlState.zoom,
      viewportBounds: null,
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
      urlState.center,
      urlState.zoom,
    ]
  );

  return {
    state,
    commitState,
  };
}

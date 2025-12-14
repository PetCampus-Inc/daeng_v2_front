import { useCallback } from 'react';
import { createParser, parseAsString, useQueryStates } from 'nuqs';
import type { BoundsSnapshot, SearchSnapshot } from '../lib/searchMachine';
import type { Coord } from '@shared/types';
import type { FilterOption } from '@entities/kindergarten';
import { FILTER_OPTIONS } from '@entities/kindergarten';
import type { RegionLevel, SearchScope } from '../config/map';

type SearchLock = 0 | 1;

const isSearchScope = (value: string): value is SearchScope => {
  return value === 'nearby' || value === 'global' || value === 'bounds';
};

const SCOPE_PARSER = createParser<SearchScope | null>({
  parse: (value: string) => {
    if (!value || !isSearchScope(value)) return null;
    return value;
  },
  serialize: (value) => value ?? '',
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

const REF_POINT_PARSER = createParser<Coord | null>({
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
 * SearchSnapshot(검색상태) URL 상태를 관리하는 훅
 *
 * @description
 * ✅ useQueryStates를 사용하여 모든 검색 관련 URL 파라미터를 한 번에 관리
 * - 여러 파라미터 동시 업데이트 시 배칭 처리로 URL 업데이트 1회만 발생
 * - commitSnapshot 호출 시 7개 파라미터가 원자적으로 업데이트
 *
 * 관리하는 URL 파라미터:
 * - scope: 검색 스코프(global/nearby/bounds)
 * - searchedLevel: 검색 레벨(1/2/3)
 * - query: 검색어
 * - filters: 필터 옵션
 * - refPoint: 기준점
 * - bounds: 검색 범위 (bounds 전용, searchBounds)
 * - searchLock: 검색 잠금 상태 (bounds 전용)
 *
 * URL 정규화(스코프별 파라미터 정리)는
 * `normalizeSnapshotForUrl` 유틸로 수행한다.
 */
export function useSearchUrlState() {
  const [searchState, setSearchState] = useQueryStates({
    scope: SCOPE_PARSER,
    searchedLevel: SEARCHED_LEVEL_PARSER.withDefault(3),
    query: parseAsString.withDefault(''),
    filters: FILTERS_PARSER.withDefault([]),
    refPoint: REF_POINT_PARSER,
    bounds: BOUNDS_PARSER,
    searchLock: SEARCH_LOCK_PARSER.withDefault(0),
  });

  const { scope, searchedLevel, query, filters, refPoint, bounds, searchLock } = searchState;

  /**
   * 개별 scope 업데이트
   */
  const setScope = useCallback(
    (next: SearchScope) => {
      setSearchState({ scope: next });
    },
    [setSearchState]
  );

  /**
   * 개별 searchedLevel 업데이트
   */
  const setSearchedLevel = useCallback(
    (next: RegionLevel) => {
      setSearchState({ searchedLevel: next });
    },
    [setSearchState]
  );

  /**
   * 쿼리 업데이트 (bounds/searchLock 초기화 포함)
   */
  const setQuery = useCallback(
    (next: string) => {
      // 쿼리 변경 시 bounds/searchLock 초기화 (배칭)
      setSearchState({
        query: next,
        bounds: null,
        searchLock: 0,
      });
    },
    [setSearchState]
  );

  /**
   * 필터 업데이트 (bounds/searchLock 초기화 포함)
   */
  const setFilters = useCallback(
    (next: FilterOption[] | null) => {
      // 필터 변경 시 bounds/searchLock 초기화 (배칭)
      setSearchState({
        filters: !next || next.length === 0 ? null : next,
        bounds: null,
        searchLock: 0,
      });
    },
    [setSearchState]
  );

  /**
   * 개별 refPoint 업데이트
   */
  const setRefPoint = useCallback(
    (next: Coord | null) => {
      setSearchState({ refPoint: next });
    },
    [setSearchState]
  );

  /**
   * 개별 bounds 업데이트
   */
  const setBounds = useCallback(
    (next: BoundsSnapshot | null) => {
      setSearchState({ bounds: next });
    },
    [setSearchState]
  );

  /**
   * 개별 searchLock 업데이트
   */
  const setSearchLock = useCallback(
    (next: SearchLock) => {
      setSearchState({ searchLock: next });
    },
    [setSearchState]
  );

  /**
   * SearchSnapshot 전체를 한 번에 커밋 (배칭)
   *
   * @description
   * FSM 전이 결과를 URL에 원자적으로 반영합니다.
   * useQueryStates의 배칭 기능으로 7개 파라미터가 한 번의 URL 업데이트로 처리됩니다.
   *
   * @param next - 커밋할 SearchSnapshot
   */
  const commitSnapshot = useCallback(
    (next: SearchSnapshot) => {
      setSearchState({
        scope: next.scope,
        searchedLevel: next.searchedLevel,
        query: next.query,
        filters: next.filters.length > 0 ? next.filters : null,
        refPoint: next.refPoint,
        bounds: next.searchBounds,
        searchLock: next.searchLock,
      });
    },
    [setSearchState]
  );

  return {
    scope: scope ?? 'nearby', // scope가 null이면 기본값 'nearby'
    searchedLevel,
    query,
    filters,
    refPoint,
    bounds,
    searchLock,
    setScope,
    setSearchedLevel,
    setQuery,
    setFilters,
    setRefPoint,
    setBounds,
    setSearchLock,
    commitSnapshot,
  };
}

/**
 * 스코프별 URL 정규화
 *
 * @description
 * FSM 전이 결과를 URL에 커밋하기 전에 정규화합니다.
 * - scope='bounds' 가 아닐 때:
 *   - searchLock=0
 *   - searchBounds=null
 *
 */
export function normalizeSnapshotForUrl(snapshot: SearchSnapshot): SearchSnapshot {
  if (snapshot.scope === 'bounds') {
    // bounds 스코프에서는 bounds/searchLock을 그대로 둔다 (상위 로직에서 세팅)
    return snapshot;
  }

  const base: SearchSnapshot = {
    ...snapshot,
    searchBounds: null,
    searchLock: 0,
  };

  return base;
}

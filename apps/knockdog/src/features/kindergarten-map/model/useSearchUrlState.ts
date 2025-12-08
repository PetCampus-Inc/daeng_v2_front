import { useCallback, useEffect } from 'react';
import { createParser, parseAsString, useQueryState } from 'nuqs';
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
  const [scopeParam, setScope] = useQueryState('scope', SCOPE_PARSER);
  const [searchedLevel, setSearchedLevel] = useQueryState('searchedLevel', SEARCHED_LEVEL_PARSER.withDefault(3));
  const [query, setQuery] = useQueryState('query', parseAsString.withDefault(''));
  const [filters, setFiltersState] = useQueryState('filters', FILTERS_PARSER.withDefault([]));
  const [refPointRaw, setRefPoint] = useQueryState('refPoint', REF_POINT_PARSER);
  const [boundsRaw, setBoundsState] = useQueryState('bounds', BOUNDS_PARSER);
  const [searchLock, setSearchLock] = useQueryState('searchLock', SEARCH_LOCK_PARSER.withDefault(0));

  const setFilters = useCallback(
    (next: FilterOption[] | null) => {
      if (!next || next.length === 0) {
        setFiltersState(null);
        return;
      }
      setFiltersState(next);
    },
    [setFiltersState]
  );

  const setBounds = useCallback(
    (next: BoundsSnapshot | null) => {
      if (!next) {
        setBoundsState(null);
        return;
      }
      setBoundsState(next);
    },
    [setBoundsState]
  );

  const refPoint = refPointRaw ?? null;
  const bounds = boundsRaw ?? null;

  const hasQuery = query.trim().length > 0;
  const hasFilters = filters.length > 0;

  const resolvedScope = resolveScope({
    scopeParam,
    hasBounds: !!bounds,
    hasQueryOrFilters: hasQuery || hasFilters,
    hasRefPoint: !!refPoint,
  });

  useEffect(() => {
    if (scopeParam !== resolvedScope) {
      // 디버그: scope 정규화 로그
      // eslint-disable-next-line no-console
      console.log('[useSearchUrlState] normalize scope', { scopeParam, resolvedScope, bounds, query, filters });
      setScope(resolvedScope);
    }
  }, [scopeParam, resolvedScope, setScope]);

  return {
    scope: resolvedScope,
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
    commitSnapshot: (next: SearchSnapshot) => {
      setScope(next.scope);
      setSearchedLevel(next.searchedLevel);
      setQuery(next.query);
      setFilters(next.filters);
      setRefPoint(next.refPoint);
      setBounds(next.searchBounds);
      setSearchLock(next.searchLock);
    },
  };
}

/**
 * 스코프별 URL 정규화
 *
 * @description
 * - scope='bounds' 가 아닐 때:
 *   - searchLock=0
 *   - searchBounds=null
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

function resolveScope({
  scopeParam,
  hasBounds,
  hasQueryOrFilters,
  hasRefPoint,
}: {
  scopeParam: SearchScope | null;
  hasBounds: boolean;
  hasQueryOrFilters: boolean;
  hasRefPoint: boolean;
}): SearchScope {
  // ✅ 파생 신호가 scopeParam보다 우선
  if (hasBounds) return 'bounds';
  if (hasQueryOrFilters) return 'global';

  // ✅ scopeParam은 fallback
  if (scopeParam) return scopeParam;

  if (hasRefPoint) return 'nearby';
  return 'nearby';
}

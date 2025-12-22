import { DEFAULT_MAP_ZOOM_LEVEL, type RegionLevel, type SearchScope } from '../config/map';
import { getRegionLevel } from './markers';
import { isEqualFilters, type FilterOption } from '@entities/kindergarten';
import { isEqualBounds, isEqualCoord } from '@shared/lib';
import type { Coord } from '@shared/types';

/**
 * Bounds 모델
 */
export interface BoundsSnapshot {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface SearchSnapshot {
  scope: SearchScope;
  searchedLevel: RegionLevel;
  searchLock: 0 | 1;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: BoundsSnapshot | null;
  searchCenter: Coord | null;
}

export interface MapSnapshot {
  center: Coord | null;
  zoom: number;
  viewportBounds: BoundsSnapshot | null;
}

/**
 * 통합 검색 상태
 * - 검색 확정 상태와 지도 UI 상태를 포함
 */
export type SearchState = SearchSnapshot & MapSnapshot;

export interface UrlComparableState {
  scope: SearchScope;
  searchedLevel: RegionLevel;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: BoundsSnapshot | null;
  searchLock: 0 | 1;
  searchCenter: Coord | null;
  center: Coord | null;
  zoom: number;
}

/**
 * 검색 FSM 이벤트
 *
 * @description
 * 이벤트는 "무슨 일이 일어났는지"를 나타냅니다.
 * - 상태 전이를 트리거하는 외부 액션
 */
export type SearchEvent =
  | { type: 'ENTER' }
  | { type: 'URL_SYNC'; payload: SearchState }
  | { type: 'QUERY_CHANGED'; query: string }
  | { type: 'FILTERS_CHANGED'; filters: FilterOption[] }
  | { type: 'CLEAR_QUERY' }
  | { type: 'CLEAR_FILTERS' }
  | {
      type: 'BASEPOINT_SYNC';
      payload: {
        basePoint: Coord;
        reason: 'passive' | 'explicit';
      };
    }
  | { type: 'REFPOINT_SET'; refPoint: Coord }
  | { type: 'CENTER_CHANGED'; center: Coord }
  | {
      type: 'MAP_INTERACTION_END';
      payload: {
        center: Coord;
        zoom: number;
        viewportBounds: BoundsSnapshot | null;
        source: 'user' | 'auto-fit';
      };
    }
  | {
      type: 'AGG_MARKER_CLICK';
      payload: {
        bounds: BoundsSnapshot;
        center: Coord;
        zoom: number;
      };
    }
  | {
      type: 'RESEARCH_HERE';
      viewportBounds: BoundsSnapshot | null;
      levelFromZoom: RegionLevel;
    };

/**
 * FSM 전이 계산에 필요한 외부 컨텍스트
 *
 * @description
 * 순수 함수 원칙을 위해 외부 상태를 직접 읽지 않고,
 * 전이 시점의 필요한 값들을 명시적으로 전달받습니다.
 */
export interface SearchTransitionContext {
  /** basePoint 기반으로 보정된 refPoint */
  refPointFromBase: Coord | null;
}

const QUERY_DEFAULT_ZOOM_LEVEL = 9;

export interface SearchUrlStateInput {
  scope: SearchScope | null;
  searchedLevel: RegionLevel | null;
  query: string | null;
  filters: FilterOption[] | null;
  refPoint: Coord | null;
  bounds: BoundsSnapshot | null;
  searchLock: 0 | 1 | null;
  searchCenter: Coord | null;
  center: Coord | null;
  zoom: number | null;
}

/**
 * 검색 FSM 전이 함수 (순수 함수)
 *
 * @description
 * Extended FSM의 핵심 전이 로직을 구현합니다.
 * - 현재 상태 + 이벤트 + 컨텍스트 → 다음 상태
 *
 * @param current - 현재 검색 스냅샷 (상태 + 컨텍스트)
 * @param event - 발생한 이벤트
 * @param ctx - 전이 계산에 필요한 외부 컨텍스트
 * @returns 다음 검색 스냅샷
 *
 */
export function transition(current: SearchState, event: SearchEvent, ctx: SearchTransitionContext): SearchState {
  switch (event.type) {
    case 'URL_SYNC': {
      const mergedState: SearchState = {
        ...current,
        ...event.payload,
        viewportBounds: current.viewportBounds,
      };

      const incomingSearch = pickSearchSnapshot(mergedState);
      const incomingMap = pickMapSnapshot(mergedState);

      const queryChanged = incomingSearch.query !== current.query;
      const filtersChanged = !isEqualFilters(incomingSearch.filters, current.filters);
      const boundsChanged = !isEqualBounds(incomingSearch.searchBounds, current.searchBounds);

      let nextState = mergeSnapshots(incomingSearch, incomingMap);

      if (queryChanged) {
        nextState = applyQueryTransition(nextState, incomingSearch.query);
      }

      if (filtersChanged) {
        nextState = applyFilterTransition(nextState, incomingSearch.filters);
      }

      if (!queryChanged && !filtersChanged) {
        const targetScope = deriveScope({
          currentScope: nextState.scope,
          query: nextState.query,
          filters: nextState.filters,
        });
        nextState = applyScopeTransition(nextState, targetScope);
      }

      if (!queryChanged && !filtersChanged && boundsChanged && incomingSearch.searchBounds) {
        nextState = {
          ...nextState,
          scope: 'bounds',
          searchBounds: incomingSearch.searchBounds,
          searchLock: incomingSearch.searchLock,
          searchCenter: incomingSearch.searchCenter ?? nextState.center,
        };
      }

      const resolvedState = {
        ...nextState,
        refPoint: nextState.refPoint ?? ctx.refPointFromBase,
      };

      if (!resolvedState.searchCenter) {
        resolvedState.searchCenter = resolvedState.center;
      }

      return resolvedState;
    }

    case 'QUERY_CHANGED': {
      return applyQueryTransition(current, event.query);
    }

    case 'FILTERS_CHANGED': {
      return applyFilterTransition(current, event.filters);
    }

    case 'CLEAR_QUERY': {
      return applyQueryTransition(current, '');
    }

    case 'CLEAR_FILTERS': {
      return applyFilterTransition(current, []);
    }

    case 'BASEPOINT_SYNC': {
      const { basePoint, reason } = event.payload;

      if (reason === 'explicit') {
        const targetScope = deriveScope({
          currentScope: current.scope,
          query: current.query,
          filters: current.filters,
        });
        const scoped = applyScopeTransition(current, targetScope);

        return {
          ...scoped,
          refPoint: basePoint,
          center: basePoint,
          searchCenter: basePoint,
        };
      }

      if (isEqualCoord(current.refPoint, basePoint)) return current;

      const shouldAlignCenter = !current.refPoint;
      const nextCenter = shouldAlignCenter ? basePoint : current.center;

      return {
        ...current,
        refPoint: basePoint,
        center: nextCenter,
        searchCenter: shouldAlignCenter ? basePoint : (current.searchCenter ?? nextCenter),
      };
    }

    case 'REFPOINT_SET': {
      if (isEqualCoord(current.refPoint, event.refPoint)) return current;
      const targetScope = deriveScope({
        currentScope: current.scope,
        query: current.query,
        filters: current.filters,
      });
      const scoped = applyScopeTransition(current, targetScope);

      // RefPoint가 변경되면 scope 조건을 보정
      return {
        ...scoped,
        refPoint: event.refPoint,
        center: event.refPoint,
        searchCenter: event.refPoint,
      };
    }

    case 'CENTER_CHANGED': {
      if (isEqualCoord(current.center, event.center)) return current;
      return { ...current, center: event.center };
    }

    case 'MAP_INTERACTION_END': {
      const { center, zoom, viewportBounds, source } = event.payload;
      const from = current.searchedLevel;
      const to = getRegionLevel(zoom);

      const nextState: SearchState = {
        ...current,
        center,
        zoom,
        viewportBounds,
      };

      // 자동 fitBounds 결과는 검색 레벨을 변경하지 않는다.
      if (source === 'auto-fit') {
        return nextState;
      }

      /**
       * 우선순위 1)
       * bounds + lock=1 상태는 자동 전이 금지
       * (L3 → L2 줌아웃 포함)
       */
      if (nextState.scope === 'bounds' && nextState.searchLock === 1) {
        return nextState;
      }

      /**
       * 우선순위 2)
       * L2 → L3 줌 진입 시 자동 bounds 확정
       */
      if (from === 2 && to === 3) {
        const resolvedBounds = viewportBounds ?? nextState.searchBounds;

        return {
          ...nextState,
          scope: 'bounds',
          searchLock: 1,
          searchBounds: resolvedBounds,
          searchedLevel: to,
        };
      }

      /**
       * 우선순위 3)
       * 나머지 레벨 경계 변화는 searchedLevel만 갱신
       * → agg-only 트리거
       */
      if (from !== to) {
        return {
          ...nextState,
          searchedLevel: to,
        };
      }

      return nextState;
    }

    case 'AGG_MARKER_CLICK': {
      const { bounds, center, zoom } = event.payload;
      const from = current.searchedLevel;
      const to = getRegionLevel(zoom);

      const nextState: SearchState = {
        ...current,
        center,
        zoom,
        viewportBounds: bounds,
      };

      /**
       * 우선순위 1)
       * bounds + lock=1 상태는 자동 전이 금지
       * (L3 → L2 줌아웃 포함)
       */
      // if (nextState.scope === 'bounds' && nextState.searchLock === 1) {
      //   return nextState;
      // }

      /**
       * 우선순위 2)
       * L2 → L3 줌 진입 시 자동 bounds 확정, searchLock=0 유지
       */
      if (from === 2 && to === 3) {
        return {
          ...nextState,
          scope: 'bounds',
          searchedLevel: 3,
          searchBounds: bounds,
          searchLock: 0,
        };
      }
      /**
       * 우선순위 3)
       * 나머지 레벨 경계 변화는 searchedLevel만 갱신
       * → agg-only 트리거
       */
      if (from !== to) {
        return {
          ...nextState,
          searchedLevel: to,
        };
      }

      return nextState;
    }

    case 'RESEARCH_HERE': {
      const resolvedBounds = event.viewportBounds ?? current.viewportBounds ?? current.searchBounds;

      return {
        ...current,
        scope: 'bounds',
        searchedLevel: event.levelFromZoom,
        searchBounds: resolvedBounds,
        searchLock: 1,
        searchCenter: current.center,
      };
    }

    default:
      return current;
  }
}

export function normalizeQuery(query: string | null) {
  return query?.trim() ?? '';
}

export function normalizeUrlState(urlState: SearchUrlStateInput): UrlComparableState {
  const query = normalizeQuery(urlState.query);
  const filters = urlState.filters ?? [];
  const hasQueryOrFilters = query.length > 0 || filters.length > 0;
  const zoom = urlState.zoom ?? (hasQueryOrFilters ? QUERY_DEFAULT_ZOOM_LEVEL : DEFAULT_MAP_ZOOM_LEVEL);
  const searchedLevel = urlState.searchedLevel ?? getRegionLevel(zoom);
  const scope = urlState.scope ?? (urlState.bounds ? 'bounds' : 'nearby');

  return {
    scope,
    searchedLevel,
    query,
    filters,
    refPoint: urlState.refPoint ?? null,
    searchBounds: urlState.bounds ?? null,
    searchLock: urlState.searchLock ?? 0,
    searchCenter: urlState.searchCenter ?? null,
    center: urlState.center ?? null,
    zoom,
  };
}

export function toComparableState(state: SearchState): UrlComparableState {
  return {
    scope: state.scope,
    searchedLevel: state.searchedLevel,
    query: state.query,
    filters: state.filters,
    refPoint: state.refPoint,
    searchBounds: state.searchBounds,
    searchLock: state.searchLock,
    searchCenter: state.searchCenter,
    center: state.center,
    zoom: state.zoom,
  };
}

export function areComparableStatesEqual(left: UrlComparableState, right: UrlComparableState) {
  if (left.scope !== right.scope) return false;
  if (left.searchedLevel !== right.searchedLevel) return false;
  if (left.query !== right.query) return false;
  if (!isEqualFilters(left.filters, right.filters)) return false;
  if (!isEqualCoord(left.refPoint, right.refPoint)) return false;
  if (!isEqualBounds(left.searchBounds, right.searchBounds)) return false;
  if (left.searchLock !== right.searchLock) return false;
  if (!isEqualCoord(left.searchCenter, right.searchCenter)) return false;
  if (!isEqualCoord(left.center, right.center)) return false;
  if (left.zoom !== right.zoom) return false;
  return true;
}

export function buildUrlSyncState(urlState: SearchUrlStateInput, refPointFromBase: Coord | null): SearchState {
  const query = normalizeQuery(urlState.query);
  const filters = urlState.filters ?? [];
  const hasQueryOrFilters = query.length > 0 || filters.length > 0;
  const zoom = urlState.zoom ?? (hasQueryOrFilters ? QUERY_DEFAULT_ZOOM_LEVEL : DEFAULT_MAP_ZOOM_LEVEL);
  const searchedLevel = urlState.searchedLevel ?? getRegionLevel(zoom);
  const scope = urlState.scope ?? (urlState.bounds ? 'bounds' : 'nearby');
  const refPoint = urlState.refPoint ?? refPointFromBase ?? null;
  const center = urlState.center ?? refPoint ?? null;
  const searchCenter = urlState.searchCenter ?? center ?? refPoint ?? null;

  return {
    scope,
    searchedLevel,
    searchLock: urlState.searchLock ?? 0,
    query,
    filters,
    refPoint,
    searchBounds: urlState.bounds ?? null,
    searchCenter,
    center,
    zoom,
    viewportBounds: null,
  };
}

export function pickSearchSnapshot(state: SearchState): SearchSnapshot {
  return {
    scope: state.scope,
    searchedLevel: state.searchedLevel,
    searchLock: state.searchLock,
    query: state.query,
    filters: state.filters,
    refPoint: state.refPoint,
    searchBounds: state.searchBounds,
    searchCenter: state.searchCenter,
  };
}

export function pickMapSnapshot(state: SearchState): MapSnapshot {
  return {
    center: state.center,
    zoom: state.zoom,
    viewportBounds: state.viewportBounds,
  };
}

export function mergeSnapshots(search: SearchSnapshot, map: MapSnapshot): SearchState {
  return {
    ...search,
    ...map,
  };
}

/* =============================================================================
 * 내부 헬퍼 함수
 * ============================================================================= */

/**
 * 검색 조건으로부터 적절한 scope를 파생
 *
 * @description
 * query/filters 존재 여부와 현재 scope를 기반으로
 * 다음 scope를 결정합니다.
 *
 * 우선순위:
 * 1. query 또는 filters 존재 → global
 * 2. 현재 bounds 상태 → bounds 유지
 * 3. 기본값 → nearby
 *
 * @param params - scope 파생에 필요한 파라미터
 * @returns 파생된 SearchScope
 */
function deriveScope(params: { currentScope: SearchScope; query: string; filters: FilterOption[] }): SearchScope {
  const { currentScope, query, filters } = params;

  const hasQuery = query.trim().length > 0;
  const hasFilters = filters.length > 0;

  // query/filters가 있으면 글로벌 우선
  if (hasQuery || hasFilters) return 'global';

  // 기존이 bounds면 유지(명시적 검색 상태 보존)
  if (currentScope === 'bounds') return 'bounds';

  // 기본값
  return 'nearby';
}

/**
 * scope 전이 시 관련 상태 정리
 *
 * @description
 * scope가 변경될 때, 관련 상태를 일관성 있게 관리합니다.
 * - bounds가 아닌 scope로 이동 시 searchBounds/searchLock 초기화
 *
 * @param current - 현재 검색 스냅샷
 * @param targetScope - 목표 scope
 * @returns 전이된 검색 스냅샷
 */
function applyScopeTransition(current: SearchState, targetScope: SearchScope): SearchState {
  if (targetScope === current.scope) return current;

  if (targetScope === 'bounds') {
    return {
      ...current,
      scope: 'bounds',
    };
  }

  return {
    ...current,
    scope: targetScope,
    searchBounds: null,
    searchLock: 0,
  };
}

/**
 * 쿼리 변경 전이 처리
 *
 * @description
 * 쿼리 변경 시 scope를 재계산하고 컨텍스트를 업데이트합니다.
 *
 * @param current - 현재 검색 스냅샷
 * @param nextQuery - 새로운 쿼리
 * @returns 전이된 검색 스냅샷
 */
function applyQueryTransition(current: SearchState, nextQuery: string): SearchState {
  const targetScope = deriveScope({
    currentScope: current.scope,
    query: nextQuery,
    filters: current.filters,
  });

  const scoped = applyScopeTransition(current, targetScope);

  return {
    ...scoped,
    searchedLevel: 1,
    zoom: 9,
    query: nextQuery,
    searchCenter: current.center,
  };
}

/**
 * 필터 변경 전이 처리
 *
 * @description
 * 필터 변경 시 scope를 재계산하고 컨텍스트를 업데이트합니다.
 *
 * @param current - 현재 검색 스냅샷
 * @param nextFilters - 새로운 필터 배열
 * @returns 전이된 검색 스냅샷
 */
function applyFilterTransition(current: SearchState, nextFilters: FilterOption[]): SearchState {
  const targetScope = deriveScope({
    currentScope: current.scope,
    query: current.query,
    filters: nextFilters,
  });

  const scoped = applyScopeTransition(current, targetScope);

  return {
    ...scoped,
    searchedLevel: 1,
    zoom: 9,
    filters: nextFilters,
    searchCenter: current.center,
  };
}

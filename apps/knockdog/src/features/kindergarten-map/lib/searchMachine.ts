import type { RegionLevel, SearchScope } from '../config/map';
import { getRegionLevel } from './markers';
import type { FilterOption } from '@entities/kindergarten';
import { isEqualCoord } from '@shared/lib';
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

/**
 * 통합 검색 상태
 * - 검색 확정 상태와 지도 UI 상태를 포함
 */
export interface SearchState {
  // --- 검색 확정 상태 (구 SearchSnapshot) ---
  scope: SearchScope;
  searchedLevel: RegionLevel;
  searchLock: 0 | 1;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: BoundsSnapshot | null;

  // --- 커밋된 상태 ---
  searchCenter: Coord | null;

  // --- 지도 UI 상태 (구 MapSnapshot) ---
  center: Coord | null;
  zoom: number;
  viewportBounds: BoundsSnapshot | null;
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
  | { type: 'QUERY_CHANGED'; query: string }
  | { type: 'FILTERS_CHANGED'; filters: FilterOption[] }
  | { type: 'CLEAR_QUERY' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'REFPOINT_SET'; refPoint: Coord }
  | { type: 'CENTER_CHANGED'; center: Coord }
  | {
      type: 'MAP_INTERACTION_END';
      payload: {
        center: Coord;
        zoom: number;
        viewportBounds: BoundsSnapshot | null;
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
    case 'ENTER': {
      const targetScope = deriveScope({
        currentScope: current.scope,
        query: current.query,
        filters: current.filters,
      });

      const scoped = applyScopeTransition(current, targetScope);

      const nextState: SearchState = {
        ...scoped,
        searchedLevel: getRegionLevel(current.zoom),
        refPoint: ctx.refPointFromBase ?? current.refPoint,
      };

      if (!nextState.searchCenter) {
        nextState.searchCenter = nextState.center;
      }

      return nextState;
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

    case 'REFPOINT_SET': {
      if (isEqualCoord(current.refPoint, event.refPoint)) return current;
      // RefPoint가 변경되면 scope nearby로 전환
      return {
        ...current,
        refPoint: event.refPoint,
        center: event.refPoint,
        scope: 'nearby',
        searchBounds: null,
        searchLock: 0,
        searchCenter: event.refPoint,
      };
    }

    case 'CENTER_CHANGED': {
      if (isEqualCoord(current.center, event.center)) return current;
      return { ...current, center: event.center };
    }

    case 'MAP_INTERACTION_END': {
      const { center, zoom, viewportBounds } = event.payload;
      const from = current.searchedLevel;
      const to = getRegionLevel(zoom);

      const nextState: SearchState = {
        ...current,
        center,
        zoom,
        viewportBounds,
      };

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

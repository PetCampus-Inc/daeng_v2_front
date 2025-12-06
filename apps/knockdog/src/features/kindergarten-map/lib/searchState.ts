import type { FilterOption } from '@entities/kindergarten';
import type { Coord } from '@shared/types';

// 검색 스코프
export type SearchScope = 'nearby' | 'global' | 'bounds';

// 줌 레벨 → 논리 레벨
export type RegionLevel = 1 | 2 | 3;

// SDK 타입을 직접 쓰지 않는 추상 Bounds
export interface BoundsSnapshot {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

// MapSnapshot: 화면 뷰포트 상태 (로컬)
export interface MapSnapshot {
  center: Coord | null;
  zoom: number;
  viewportBounds: BoundsSnapshot | null;
}

// SearchSnapshot: 검색 확정 상태 (API 트리거 기준)
export interface SearchSnapshot {
  scope: SearchScope;
  searchedLevel: RegionLevel;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: BoundsSnapshot | null;
  searchLock: 0 | 1;
}

export type SearchEvent =
  // 앱 진입 / 초기 검색 시작
  | {
      type: 'ENTER';
    }
  // query 변경
  | {
      type: 'SET_QUERY';
      query: string;
    }
  // filters 변경
  | {
      type: 'SET_FILTERS';
      filters: FilterOption[];
    }
  // query 제거
  | {
      type: 'CLEAR_QUERY';
    }
  // filters 제거
  | {
      type: 'CLEAR_FILTERS';
    }
  // 지도 이동/줌 (MapSnapshot만 바뀌는 이벤트)
  | {
      type: 'MAP_CHANGE';
      mapSnapshot: MapSnapshot;
    }
  // 줌 레벨 경계 통과 등 레벨 변화
  | {
      type: 'ZOOM_LEVEL_CHANGE';
      prevLevel: RegionLevel;
      nextLevel: RegionLevel;
      viewportBounds: BoundsSnapshot | null;
    }
  // 집계 마커 클릭 → bounds 확정
  | {
      type: 'AGG_MARKER_CLICK';
      bounds: BoundsSnapshot;
    }
  // “현 위치에서 재검색” → 현재 viewportBounds로 bounds 확정
  | {
      type: 'RESEARCH_HERE';
      viewportBounds: BoundsSnapshot | null;
      levelFromZoom: RegionLevel;
    };

/**
 * Reducer Context
 */

export interface SearchReducerContext {
  mapSnapshot: MapSnapshot;
  regionLevelFromZoom: RegionLevel;
  refPointFromBase: Coord | null;
}

/**
 * SearchSnapshot Reducer Interface
 */

export function searchSnapshotReducer(
  state: SearchSnapshot,
  event: SearchEvent,
  context: SearchReducerContext
): SearchSnapshot {
  switch (event.type) {
    case 'ENTER': {
      const nextScope = deriveScopeFromInputs(state.scope, state.query, state.filters);
      const scoped = adjustScope(state, nextScope);
      return {
        ...scoped,
        searchedLevel: context.regionLevelFromZoom,
        refPoint: context.refPointFromBase ?? state.refPoint,
      };
    }

    case 'SET_QUERY': {
      return applyQueryChange(state, event.query);
    }

    case 'SET_FILTERS': {
      return applyFilterChange(state, event.filters);
    }

    case 'CLEAR_QUERY': {
      return applyQueryChange(state, '');
    }

    case 'CLEAR_FILTERS': {
      return applyFilterChange(state, []);
    }

    case 'MAP_CHANGE': {
      // MapSnapshot만 변경되는 이벤트이므로 SearchSnapshot은 그대로 둔다.
      return state;
    }

    case 'ZOOM_LEVEL_CHANGE': {
      const { prevLevel, nextLevel, viewportBounds } = event;

      // 1) L2 → L3 자동 BOUNDS 확정
      if (prevLevel === 2 && nextLevel === 3) {
        const nextBounds = viewportBounds ?? state.searchBounds;

        return {
          ...state,
          scope: 'bounds',
          searchedLevel: 3,
          searchBounds: nextBounds,
          searchLock: 1,
        };
      }

      // 2) scope=bounds & lock=1 이면 자동 호출 금지 → SearchSnapshot 변경 없음
      if (state.scope === 'bounds' && state.searchLock === 1) {
        return state;
      }

      // 3) 그 외 레벨 경계 변화만이면 searchedLevel만 갱신 (agg-only 트리거)
      if (prevLevel !== nextLevel) {
        return {
          ...state,
          searchedLevel: nextLevel,
        };
      }

      // 레벨이 안 바뀐 경우에는 SearchSnapshot 변경 없음
      return state;
    }

    case 'AGG_MARKER_CLICK': {
      // 집계 마커 클릭 → bounds 확정 + lock=0 + L3
      return {
        ...state,
        scope: 'bounds',
        searchedLevel: 3,
        searchBounds: event.bounds,
        searchLock: 0,
      };
    }

    case 'RESEARCH_HERE': {
      // 현 위치에서 재검색 → 현재 viewportBounds로 bounds 확정 + lock=1
      const nextBounds = event.viewportBounds ?? context.mapSnapshot.viewportBounds ?? state.searchBounds;

      return {
        ...state,
        scope: 'bounds',
        searchedLevel: event.levelFromZoom,
        searchBounds: nextBounds,
        searchLock: 1,
      };
    }

    default:
      return state;
  }
}

function deriveScopeFromInputs(scope: SearchScope, query: string, filters: FilterOption[]): SearchScope {
  const hasQuery = query.trim().length > 0;
  const hasFilters = filters.length > 0;
  if (hasQuery || hasFilters) return 'global';
  if (scope === 'bounds') return 'bounds';
  return 'nearby';
}

function adjustScope(state: SearchSnapshot, nextScope: SearchScope): SearchSnapshot {
  if (nextScope === state.scope) {
    return state;
  }
  if (nextScope === 'bounds') {
    return {
      ...state,
      scope: nextScope,
    };
  }
  return {
    ...state,
    scope: nextScope,
    searchBounds: null,
    searchLock: 0,
  };
}

function applyQueryChange(state: SearchSnapshot, query: string): SearchSnapshot {
  const nextScope = deriveScopeFromInputs(state.scope, query, state.filters);
  const scoped = adjustScope(state, nextScope);
  return {
    ...scoped,
    query,
  };
}

function applyFilterChange(state: SearchSnapshot, filters: FilterOption[]): SearchSnapshot {
  const nextScope = deriveScopeFromInputs(state.scope, state.query, filters);
  const scoped = adjustScope(state, nextScope);
  return {
    ...scoped,
    filters,
  };
}

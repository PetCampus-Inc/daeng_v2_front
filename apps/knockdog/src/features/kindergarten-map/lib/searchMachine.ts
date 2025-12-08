import type { RegionLevel, SearchScope } from '../config/map';
import type { FilterOption } from '@entities/kindergarten';
import type { Coord } from '@shared/types';

/**
 * 도메인 친화적인 Bounds 모델
 * - SDK 타입을 노출하지 않는다.
 */
export interface BoundsSnapshot {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

/**
 * 화면 뷰 상태(로컬)
 * - 드래그/줌 등 고빈도 변경 대상
 * - 검색 트리거 기준이 아니다.
 */
export interface MapSnapshot {
  center: Coord | null;
  zoom: number;
  viewportBounds: BoundsSnapshot | null;
}

/**
 * 검색 "확정" 상태
 * - API 트리거 기준
 * - URL Source of Truth 대상
 */
export interface SearchSnapshot {
  scope: SearchScope;
  searchedLevel: RegionLevel;
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: BoundsSnapshot | null;
  searchLock: 0 | 1;
}

/**
 * Search FSM 이벤트
 * - Map 이동/줌 자체는 제외한다.
 * - "레벨 경계 통과" 같은 검색 정책 이벤트만 포함한다.
 */
export type SearchEvent =
  | { type: 'ENTER' }
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SET_FILTERS'; filters: FilterOption[] }
  | { type: 'CLEAR_QUERY' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'REFPOINT_SET'; refPoint: Coord }
  | {
      type: 'ZOOM_LEVEL_CHANGE';
      prevLevel: RegionLevel;
      nextLevel: RegionLevel;
      viewportBounds: BoundsSnapshot | null;
    }
  | { type: 'AGG_MARKER_CLICK'; bounds: BoundsSnapshot }
  | {
      type: 'RESEARCH_HERE';
      viewportBounds: BoundsSnapshot | null;
      levelFromZoom: RegionLevel;
    };

/**
 * transition 계산에 필요한 "외부 입력"
 * - 머신은 외부 상태를 직접 읽지 않는다.
 */
export interface SearchTransitionContext {
  /** 이벤트 시점의 최신 지도 스냅샷 */
  map: MapSnapshot;
  /** 현재 줌 기준 레벨 */
  levelFromZoom: RegionLevel;
  /** basePoint 기반으로 보정된 refPoint */
  refPointFromBase: Coord | null;
}

/**
 * SearchSnapshot FSM
 * - URL을 SoT로 두고, 이 함수는 "전이 규칙만" 정의한다.
 */
export function transitionSearchSnapshot(
  current: SearchSnapshot,
  event: SearchEvent,
  ctx: SearchTransitionContext
): SearchSnapshot {
  switch (event.type) {
    case 'ENTER': {
      const targetScope = deriveScope({
        currentScope: current.scope,
        query: current.query,
        filters: current.filters,
      });

      const scoped = applyScopeTransition(current, targetScope);

      return {
        ...scoped,
        searchedLevel: ctx.levelFromZoom,
        refPoint: ctx.refPointFromBase ?? current.refPoint,
      };
    }

    case 'SET_QUERY': {
      return applyQueryTransition(current, event.query);
    }

    case 'SET_FILTERS': {
      return applyFilterTransition(current, event.filters);
    }

    case 'CLEAR_QUERY': {
      return applyQueryTransition(current, '');
    }

    case 'CLEAR_FILTERS': {
      return applyFilterTransition(current, []);
    }

    case 'REFPOINT_SET': {
      if (areCoordsEqual(current.refPoint, event.refPoint)) return current;
      return { ...current, refPoint: event.refPoint };
    }

    case 'ZOOM_LEVEL_CHANGE': {
      const { prevLevel, nextLevel, viewportBounds } = event;

      /**
       * 우선순위 1)
       * L2 → L3 줌 진입 시 자동 bounds 확정
       */
      if (prevLevel === 2 && nextLevel === 3) {
        const resolvedBounds = viewportBounds ?? current.searchBounds;

        return {
          ...current,
          scope: 'bounds',
          searchedLevel: 3,
          searchBounds: resolvedBounds,
          searchLock: 1,
        };
      }

      /**
       * 우선순위 2)
       * bounds + lock=1 상태는 자동 전이 금지
       * (L3 → L2 줌아웃 포함)
       */
      if (current.scope === 'bounds' && current.searchLock === 1) {
        return current;
      }

      /**
       * 우선순위 3)
       * 나머지 레벨 경계 변화는 searchedLevel만 갱신
       * → agg-only 트리거
       */
      if (prevLevel !== nextLevel) {
        return {
          ...current,
          searchedLevel: nextLevel,
        };
      }

      return current;
    }

    case 'AGG_MARKER_CLICK': {
      return {
        ...current,
        scope: 'bounds',
        searchedLevel: 3,
        searchBounds: event.bounds,
        searchLock: 0,
      };
    }

    case 'RESEARCH_HERE': {
      const resolvedBounds = event.viewportBounds ?? ctx.map.viewportBounds ?? current.searchBounds;

      return {
        ...current,
        scope: 'bounds',
        searchedLevel: event.levelFromZoom,
        searchBounds: resolvedBounds,
        searchLock: 1,
      };
    }

    default:
      return current;
  }
}

/* =============================================================================
 * 내부 헬퍼
 * ============================================================================= */

/** deriveScope 입력 객체 형태로 명확화 */
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
 * scope 전이 규칙
 * - bounds가 아닌 scope로 이동하면 lock/bounds를 정리한다.
 */
function applyScopeTransition(current: SearchSnapshot, targetScope: SearchScope): SearchSnapshot {
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

function applyQueryTransition(current: SearchSnapshot, nextQuery: string): SearchSnapshot {
  const targetScope = deriveScope({
    currentScope: current.scope,
    query: nextQuery,
    filters: current.filters,
  });

  const scoped = applyScopeTransition(current, targetScope);

  return {
    ...scoped,
    query: nextQuery,
  };
}

function applyFilterTransition(current: SearchSnapshot, nextFilters: FilterOption[]): SearchSnapshot {
  const targetScope = deriveScope({
    currentScope: current.scope,
    query: current.query,
    filters: nextFilters,
  });

  const scoped = applyScopeTransition(current, targetScope);

  return {
    ...scoped,
    filters: nextFilters,
  };
}

function areCoordsEqual(a: Coord | null, b: Coord | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.lat === b.lat && a.lng === b.lng;
}

import type { RegionLevel, SearchScope } from '../config/map';
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
 * 화면 뷰 상태(로컬)
 * - 드래그/줌 등 고빈도 변경 대상
 */
export interface MapSnapshot {
  center: Coord | null;
  zoom: number;
  viewportBounds: BoundsSnapshot | null;
}

/**
 * 검색 스냅샷
 * - 검색 트리거 기준
 */
export interface SearchSnapshot {
  /**
   * 검색 상태 (유한한 상태)
   *
   * - scope: 검색 범위 모드
   * - searchedLevel: 행정구역 레벨
   * - searchLock: bounds 잠금 여부
   */
  scope: SearchScope;
  searchedLevel: RegionLevel;
  searchLock: 0 | 1;

  /**
   * 검색 컨텍스트 (무한한 데이터)
   *
   * - query: 검색어 (문자열)
   * - filters: 필터 조합 (배열)
   * - refPoint: 기준점 좌표
   * - searchBounds: 검색 영역 사각형
   */
  query: string;
  filters: FilterOption[];
  refPoint: Coord | null;
  searchBounds: BoundsSnapshot | null;
}

/**
 * 검색 FSM 이벤트
 *
 * @description
 * 이벤트는 "무슨 일이 일어났는지"를 나타냅니다.
 * - 상태 전이를 트리거하는 외부 액션
 *
 * 상태 다이어그램:
 * ```
 *   ┌─────────┐
 *   │ NEARBY  │
 *   └─────────┘
 *        │
 *        │ QUERY_CHANGED / FILTERS_CHANGED
 *        ↓
 *   ┌─────────┐
 *   │ GLOBAL  │
 *   └─────────┘
 *        │
 *        │ ZOOM_LEVEL_CHANGED (L2→L3)
 *        ↓
 *   ┌─────────┐
 *   │ BOUNDS  │───┐
 *   │ lock=1  │   │ ZOOM_LEVEL_CHANGED (blocked)
 *   └─────────┘←──┘
 *        │
 *        │ QUERY_CHANGED
 *        ↓
 *   ┌─────────┐
 *   │ GLOBAL  │
 *   └─────────┘
 * ```
 * // MEMO: 이벤트는 수동형, 과거형 네이밍으로 한다. 그럼 'CLEAR_QUERY' 같은 이름이 적절한가? 리뷰 필요.
 */
export type SearchEvent =
  | { type: 'ENTER' }
  | { type: 'QUERY_CHANGED'; query: string }
  | { type: 'FILTERS_CHANGED'; filters: FilterOption[] }
  | { type: 'CLEAR_QUERY' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'REFPOINT_SET'; refPoint: Coord }
  | {
      type: 'ZOOM_LEVEL_CHANGED';
      from: RegionLevel;
      to: RegionLevel;
      viewportBounds: BoundsSnapshot | null;
    }
  | { type: 'AGG_MARKER_CLICK'; bounds: BoundsSnapshot }
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
  /** 이벤트 시점의 최신 지도 스냅샷 */
  map: MapSnapshot;
  /** 현재 줌 기준 레벨 */
  levelFromZoom: RegionLevel;
  /** basePoint 기반으로 보정된 refPoint */
  refPointFromBase: Coord | null;
}

/**
 * 검색 FSM 전이 함수 (순수 함수)
 *
 * @description
 * Extended FSM의 핵심 전이 로직을 구현합니다.
 * - 현재 상태 + 이벤트 + 컨텍스트 → 다음 상태
 * - 부수 효과(side-effect) 없음
 * - 테스트 가능, 예측 가능
 *
 * @param current - 현재 검색 스냅샷 (상태 + 컨텍스트)
 * @param event - 발생한 이벤트
 * @param ctx - 전이 계산에 필요한 외부 컨텍스트
 * @returns 다음 검색 스냅샷
 *
 * @example
 * ```ts
 * const next = transitionSearchSnapshot(
 *   { scope: 'global', searchedLevel: 2, ... },
 *   { type: 'ZOOM_LEVEL_CHANGED', from: 2, to: 3, ... },
 *   { map: {...}, levelFromZoom: 3, ... }
 * );
 * // next.scope === 'bounds'
 * // next.searchLock === 1
 * ```
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
      return { ...current, refPoint: event.refPoint };
    }

    case 'ZOOM_LEVEL_CHANGED': {
      const { from, to, viewportBounds } = event;

      /**
       * 우선순위 1)
       * bounds + lock=1 상태는 자동 전이 금지
       * (L3 → L2 줌아웃 포함)
       */
      if (current.scope === 'bounds' && current.searchLock === 1) {
        return current;
      }

      /**
       * 우선순위 2)
       * L2 → L3 줌 진입 시 자동 bounds 확정
       */
      if (from === 2 && to === 3) {
        const resolvedBounds = viewportBounds ?? current.searchBounds;

        return {
          ...current,
          scope: 'bounds',
          searchLock: 1,
          searchBounds: resolvedBounds,
        };
      }

      /**
       * 우선순위 3)
       * 나머지 레벨 경계 변화는 searchedLevel만 갱신
       * → agg-only 트리거
       */
      if (from !== to) {
        return {
          ...current,
          searchedLevel: to,
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

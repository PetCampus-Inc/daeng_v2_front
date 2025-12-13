import {
  type BoundsSnapshot,
  type MapSnapshot,
  type SearchEvent,
  type SearchSnapshot,
  type SearchTransitionContext,
  transitionSearchSnapshot,
} from '../lib/searchMachine';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { normalizeSnapshotForUrl, useSearchUrlState } from './useSearchUrlState';
import { getRegionLevel } from '../lib/markers';
import type { FilterOption } from '@entities/kindergarten';
import { useBasePoint } from '@shared/lib';
import type { Coord } from '@shared/types';

/**
 * 검색 머신 Context 값
 *
 * @description
 * SearchStateProvider를 통해 제공되는 검색 FSM 관련 값들
 */
interface SearchMachineContextValue {
  /** 현재 검색 스냅샷 (URL로부터 파생) */
  snapshot: SearchSnapshot;
  /** 현재 지도 스냅샷 (로컬 상태) */
  mapSnapshot: MapSnapshot;
  /** FSM 이벤트 디스패처 */
  dispatch: (event: SearchEvent) => void;
  /** 지도 스냅샷 업데이트 함수 */
  updateMapSnapshot: (next: MapSnapshot) => void;
}

const SearchMachineContext = createContext<SearchMachineContextValue | null>(null);

/**
 * 검색 상태 Provider (FSM 구동)
 *
 * @description
 * Extended FSM을 React Context로 제공합니다.
 * - URL을 Source of Truth로 관리
 * - FSM 전이 규칙에 따라 상태 변경
 * - 순수 함수 기반 전이 로직 (테스트 가능)
 *
 * 아키텍처:
 * ```
 * URL (SoT)
 *   ↓
 * SearchSnapshot (검색 확정 상태)
 *   ↓
 * FSM (transitionSearchSnapshot)
 *   ↓
 * API Queries (React Query)
 *   ↓
 * UI Rendering
 * ```
 *
 * @param props.children - 하위 컴포넌트
 */
export function SearchStateProvider({ children }: { children: ReactNode }) {
  const { coord: basePoint, type: baseType } = useBasePoint();

  /**
   * MapSnapshot 로컬 상태
   * - 드래그/줌 등 고빈도 변경
   * - SearchSnapshot과 독립적으로 관리
   */
  const [mapSnapshot, setMapSnapshot] = useState<MapSnapshot>({
    center: null,
    zoom: 0,
    viewportBounds: null,
  });

  /**
   * 이벤트 시점의 최신 값 보장을 위한 ref
   * - 비동기 이벤트 핸들러에서 stale closure 방지
   */
  const mapRef = useRef<MapSnapshot>(mapSnapshot);
  useEffect(() => {
    mapRef.current = mapSnapshot;
  }, [mapSnapshot]);

  /**
   * URL을 Source of Truth로 사용
   * - 검색 상태의 영속성 보장
   * - 공유/북마크/뒤로가기 지원
   */
  const urlState = useSearchUrlState();
  const { scope, searchedLevel, query, filters, refPoint, bounds, searchLock, commitSnapshot } = urlState;

  /**
   * URL 상태로부터 SearchSnapshot 생성
   * - URL 파라미터 → 정규화된 검색 스냅샷
   */
  const snapshot: SearchSnapshot = useMemo(
    () => ({
      scope,
      searchedLevel,
      query,
      filters,
      refPoint,
      searchBounds: bounds,
      searchLock,
    }),
    [scope, searchedLevel, query, filters, refPoint, bounds, searchLock]
  );

  /**
   * 최신 snapshot/commitSnapshot을 항상 참조하기 위한 ref
   *
   * @description
   * useEffectEvent의 제약(Effect 내부에서만 사용 가능)을 우회하기 위해
   * ref 패턴을 사용하여 dispatch를 안정화합니다.
   */
  const snapshotRef = useRef(snapshot);
  const commitSnapshotRef = useRef(commitSnapshot);

  useEffect(() => {
    snapshotRef.current = snapshot;
    commitSnapshotRef.current = commitSnapshot;
  }, [snapshot, commitSnapshot]);

  /**
   * FSM 전이 컨텍스트 빌더
   *
   * @description
   * 전이 함수에 필요한 외부 컨텍스트를 생성합니다.
   * - ref를 통해 최신 snapshot/basePoint 참조
   * - overrideMap: 이벤트 핸들러에서 최신 map 상태를 전달할 때 사용
   *
   * @param overrideMap - 강제로 사용할 map 스냅샷 (선택)
   * @returns FSM 전이 컨텍스트
   */
  const buildTransitionContext = useCallback(
    (overrideMap?: MapSnapshot): SearchTransitionContext => {
      const effectiveMap = overrideMap ?? mapRef.current;
      const currentSnapshot = snapshotRef.current;

      return {
        map: effectiveMap,
        levelFromZoom: getRegionLevel(effectiveMap.zoom),
        refPointFromBase: currentSnapshot.refPoint ?? basePoint ?? null,
      };
    },
    [basePoint]
  );

  /**
   * FSM 이벤트 디스패처 (안정적인 참조 보장)
   *
   * @description
   * FSM 이벤트를 발생시켜 상태 전이를 트리거합니다.
   *
   * ✅ ref 패턴 적용으로 snapshot 변경에도 동일한 참조 유지
   * - 하위 컴포넌트 useEffect deps에 안전하게 사용 가능
   * - 불필요한 effect 재실행 방지
   *
   * 동작 흐름:
   * 1. ref를 통해 최신 snapshot 획득
   * 2. 현재 snapshot + 이벤트 + 컨텍스트로 다음 snapshot 계산
   * 3. URL 정규화 (scope별 파라미터 정리)
   * 4. 변경 감지 후 URL에 커밋
   *
   * @param event - 발생시킬 FSM 이벤트
   * @param overrideMap - 강제로 사용할 map 스냅샷 (선택)
   */
  const dispatch = useCallback(
    (event: SearchEvent, overrideMap?: MapSnapshot) => {
      const prev = snapshotRef.current;
      const ctx = buildTransitionContext(overrideMap);

      // 디버그: 이벤트 입력과 컨텍스트 확인
      // eslint-disable-next-line no-console
      console.log('[searchMachine] event', event, 'ctx.map', ctx.map);

      const rawNext = transitionSearchSnapshot(prev, event, ctx);
      const next = normalizeSnapshotForUrl(rawNext);

      // 디버그: 전이 결과
      // eslint-disable-next-line no-console
      console.log('[searchMachine] snapshot prev->next', prev, next);

      // 실제 변경이 있을 때만 URL 업데이트
      if (
        next.scope !== prev.scope ||
        next.searchedLevel !== prev.searchedLevel ||
        next.query !== prev.query ||
        !areFilterArraysEqual(next.filters, prev.filters) ||
        !areCoordsEqual(next.refPoint, prev.refPoint) ||
        !areBoundsEqual(next.searchBounds, prev.searchBounds) ||
        next.searchLock !== prev.searchLock
      ) {
        commitSnapshotRef.current(next);
      }
    },
    [buildTransitionContext]
  );

  /**
   * refPoint 자동 관리 (Effect)
   *
   * @description
   * basePoint 변경 시 refPoint를 자동으로 동기화합니다.
   *
   * 동작 규칙:
   * 1. URL refPoint 없음 + basePoint 도착 → refPoint 초기 설정
   * 2. baseType 변경 (현위치→집→직장) → refPoint 업데이트
   *
   * ⚠️ FIXME: baseType 변경 추적을 effect 대신 이벤트 핸들러로 변경 권장
   * - 현재: effect 기반 → 타이밍 이슈 가능
   * - 개선: SegmentedControl onChange에서 직접 dispatch
   */
  const prevBaseTypeRef = useRef(baseType);
  useEffect(() => {
    if (!basePoint) return;

    // Case 1: 초기 refPoint 설정
    if (!snapshot.refPoint) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
      prevBaseTypeRef.current = baseType;
      return;
    }

    // Case 2: baseType 변경 시 refPoint 업데이트
    const baseTypeChanged = prevBaseTypeRef.current !== baseType;
    if (baseTypeChanged && !areCoordsEqual(snapshot.refPoint, basePoint)) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
    }
    prevBaseTypeRef.current = baseType;
  }, [basePoint, baseType, snapshot, dispatch]);

  /**
   * 지도 스냅샷 업데이트 함수
   *
   * @description
   * MapSnapshot(로컬 상태)를 업데이트합니다.
   * - SearchSnapshot과 독립적으로 동작
   * - 드래그/줌 등 고빈도 이벤트에 사용
   *
   * @param next - 새로운 지도 스냅샷
   */
  const updateMapSnapshot = useCallback((next: MapSnapshot) => {
    // 디버그: 지도 스냅샷 업데이트
    // eslint-disable-next-line no-console
    console.log('[searchMachine] updateMapSnapshot', next);
    setMapSnapshot(next);
    mapRef.current = next;
  }, []);

  /**
   * Context value 메모이제이션
   *
   * @description
   * 불필요한 하위 컴포넌트 리렌더 방지
   *
   * ⚠️ 주의: snapshot/dispatch 변경 시 모든 Consumer 리렌더됨
   */
  const value = useMemo<SearchMachineContextValue>(
    () => ({
      snapshot,
      mapSnapshot,
      dispatch,
      updateMapSnapshot,
    }),
    [snapshot, mapSnapshot, dispatch, updateMapSnapshot]
  );

  return <SearchMachineContext.Provider value={value}>{children}</SearchMachineContext.Provider>;
}

/**
 * 검색 머신 훅
 *
 * @description
 * SearchStateProvider 하위에서 검색 FSM 상태에 접근합니다.
 *
 * @returns 검색 머신 context 값
 * @throws SearchStateProvider 외부에서 호출 시 에러
 *
 * @example
 * ```tsx
 * function SearchResults() {
 *   const { snapshot, dispatch } = useSearchMachine();
 *
 *   return (
 *     <button onClick={() => dispatch({ type: 'QUERY_CHANGED', query: '강남구' })}>
 *       검색
 *     </button>
 *   );
 * }
 * ```
 */
export function useSearchMachine(): SearchMachineContextValue {
  const ctx = useContext(SearchMachineContext);
  if (!ctx) {
    throw new Error('useSearchMachine은 SearchStateProvider 하위에서만 사용할 수 있습니다.');
  }
  return ctx;
}

/* =============================================================================
 * 비교 유틸리티 함수
 * ============================================================================= */

/**
 * 좌표 동등성 비교
 *
 * @param a - 첫 번째 좌표 (nullable)
 * @param b - 두 번째 좌표 (nullable)
 * @returns 두 좌표가 같으면 true
 */
function areCoordsEqual(a: Coord | null, b: Coord | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.lat === b.lat && a.lng === b.lng;
}

/**
 * Bounds 동등성 비교
 *
 * @description
 * 두 bounds가 완전히 동일한지 확인합니다.
 * - SW/NE 좌표 모두 일치해야 true
 *
 * @param a - 첫 번째 bounds (nullable)
 * @param b - 두 번째 bounds (nullable)
 * @returns 두 bounds가 같으면 true
 */
export function areBoundsEqual(a: BoundsSnapshot | null, b: BoundsSnapshot | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.swLat === b.swLat && a.swLng === b.swLng && a.neLat === b.neLat && a.neLng === b.neLng;
}

/**
 * 필터 배열 동등성 비교
 *
 * @description
 * 필터 배열의 순서와 요소가 모두 동일한지 확인합니다.
 *
 * @param a - 첫 번째 필터 배열
 * @param b - 두 번째 필터 배열
 * @returns 두 배열이 같으면 true
 */
function areFilterArraysEqual(a: FilterOption[], b: FilterOption[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

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

interface SearchMachineContextValue {
  snapshot: SearchSnapshot;
  mapSnapshot: MapSnapshot;
  dispatch: (event: SearchEvent) => void;
  updateMapSnapshot: (next: MapSnapshot) => void;
}

const SearchMachineContext = createContext<SearchMachineContextValue | null>(null);

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const { coord: basePoint, type: baseType } = useBasePoint();

  /**
   * MapSnapshot 로컬 상태
   */
  const [mapSnapshot, setMapSnapshot] = useState<MapSnapshot>({
    center: null,
    zoom: 0,
    viewportBounds: null,
  });

  /**
   * 이벤트 시점의 최신 값 보장을 위한 ref
   */
  const mapRef = useRef<MapSnapshot>(mapSnapshot);
  useEffect(() => {
    mapRef.current = mapSnapshot;
  }, [mapSnapshot]);

  /**
   * URL SoT
   */
  const urlState = useSearchUrlState();
  const { scope, searchedLevel, query, filters, refPoint, bounds, searchLock, commitSnapshot } = urlState;

  /**
   * URL → SearchSnapshot view
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
   * SearchTransitionContext 생성
   */
  const buildTransitionContext = useCallback(
    (overrideMap?: MapSnapshot): SearchTransitionContext => {
      const effectiveMap = overrideMap ?? mapRef.current;

      return {
        map: effectiveMap,
        levelFromZoom: getRegionLevel(effectiveMap.zoom),
        refPointFromBase: snapshot.refPoint ?? basePoint ?? null,
      };
    },
    [basePoint, snapshot.refPoint]
  );

  /**
   * FSM 전이 계산 후 URL 커밋
   */
  const commitEvent = useCallback(
    (event: SearchEvent, overrideMap?: MapSnapshot) => {
      const prev = snapshot;
      const ctx = buildTransitionContext(overrideMap);

      // 디버그: 이벤트 입력과 컨텍스트 확인
      // eslint-disable-next-line no-console
      console.log('[searchMachine] event', event, 'ctx.map', ctx.map);

      const rawNext = transitionSearchSnapshot(prev, event, ctx);
      const next = normalizeSnapshotForUrl(rawNext);

      // 디버그: 전이 결과
      // eslint-disable-next-line no-console
      console.log('[searchMachine] snapshot prev->next', prev, next);

      if (
        next.scope !== prev.scope ||
        next.searchedLevel !== prev.searchedLevel ||
        next.query !== prev.query ||
        !areFilterArraysEqual(next.filters, prev.filters) ||
        !areCoordsEqual(next.refPoint, prev.refPoint) ||
        !areBoundsEqual(next.searchBounds, prev.searchBounds) ||
        next.searchLock !== prev.searchLock
      ) {
        commitSnapshot(next);
      }
    },
    [snapshot, buildTransitionContext, commitSnapshot]
  );

  // TODO: dispatch/commitEvent가 snapshot 변화에 따라 새로 생성되는 구조라 상위 컴포넌트 effect가 반복 실행된다.
  //       useEvent-stable한 dispatch를 제공하도록 리팩터링하고, URL 커밋은 내부에서만 처리하도록 단일 책임화할 것.

  /**
   * low-level dispatch
   */
  const dispatch = useCallback((event: SearchEvent) => commitEvent(event), [commitEvent]);

  /**
   * refPoint 자동 채움 / 사용자 의도 기반 갱신
   * - URL refPoint가 없고 basePoint가 도착하면 즉시 refPoint로 채운다.
   * - 기준점 타입이 바뀌었고 basePoint가 있으면 refPoint를 새 기준점으로 갱신한다.
   *   (URL 공유/재진입 시 동일 기준점을 재현하기 위함)
   * FIXME: baseType 변경 추적은 이벤트 핸들러 기반으로 변경하는게 더 명확할 듯.
   */
  const prevBaseTypeRef = useRef(baseType);
  useEffect(() => {
    if (!basePoint) return;

    if (!snapshot.refPoint) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
      prevBaseTypeRef.current = baseType;
      return;
    }

    const baseTypeChanged = prevBaseTypeRef.current !== baseType;
    if (baseTypeChanged && !areCoordsEqual(snapshot.refPoint, basePoint)) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
    }
    prevBaseTypeRef.current = baseType;
  }, [basePoint, baseType, snapshot, dispatch]);

  /**
   * MapSnapshot 업데이트(로컬)
   * - SearchSnapshot을 건드리지 않는다.
   * - 단, 후속 FSM 이벤트가 최신 map을 보도록 override 전달 가능 구조 유지
   */
  const updateMapSnapshot = useCallback((next: MapSnapshot) => {
    // 디버그: 지도 스냅샷 업데이트
    // eslint-disable-next-line no-console
    console.log('[searchMachine] updateMapSnapshot', next);
    setMapSnapshot(next);
    mapRef.current = next;
  }, []);

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

export function useSearchMachine(): SearchMachineContextValue {
  const ctx = useContext(SearchMachineContext);
  if (!ctx) {
    throw new Error('useSearchMachine은 SearchStateProvider 하위에서만 사용할 수 있습니다.');
  }
  return ctx;
}

/* =============================================================================
 * 비교 유틸
 * ============================================================================= */

function areCoordsEqual(a: Coord | null, b: Coord | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.lat === b.lat && a.lng === b.lng;
}

export function areBoundsEqual(a: BoundsSnapshot | null, b: BoundsSnapshot | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.swLat === b.swLat && a.swLng === b.swLng && a.neLat === b.neLat && a.neLng === b.neLng;
}

function areFilterArraysEqual(a: FilterOption[], b: FilterOption[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

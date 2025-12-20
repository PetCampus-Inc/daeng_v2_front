import {
  areComparableStatesEqual,
  buildUrlSyncState,
  mergeSnapshots,
  normalizeUrlState,
  pickMapSnapshot,
  pickSearchSnapshot,
  toComparableState,
  type MapSnapshot,
  type SearchEvent,
  type SearchSnapshot,
  type SearchState,
  type SearchTransitionContext,
  transition,
} from '../lib/searchMachine';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchUrlState } from './useSearchUrlState';
import { isEqualFilters } from '@entities/kindergarten';
import { useBasePoint } from '@entities/user';
import { isEqualBounds, isEqualCoord } from '@shared/lib';
import type { Coord } from '@shared/types';

interface SearchMachineContextValue {
  liveState: MapSnapshot;
  committedState: SearchSnapshot;
  searchState: SearchState;
  dispatch: (event: SearchEvent, options?: DispatchOptions) => void;
}

const SearchMachineContext = createContext<SearchMachineContextValue | null>(null);

interface DispatchOptions {
  skipUrlSync?: boolean;
}

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const { coord: basePoint, type: baseType } = useBasePoint();

  const { urlState, setUrlState } = useSearchUrlState();
  const createInitialState = () => {
    const refPointFromBase = basePoint ?? null;
    const baseState = buildUrlSyncState(urlState, refPointFromBase);
    return transition(baseState, { type: 'URL_SYNC', payload: baseState }, { refPointFromBase });
  };
  const initialState = createInitialState();
  const [committedState, setCommittedState] = useState<SearchSnapshot>(() => pickSearchSnapshot(initialState));
  const [committedMapState, setCommittedMapState] = useState<MapSnapshot>(() => pickMapSnapshot(initialState));
  const [liveState, setLiveState] = useState<MapSnapshot>(() => pickMapSnapshot(initialState));

  const liveStateRef = useRef(liveState);
  const committedStateRef = useRef(committedState);
  const basePointRef = useRef<Coord | null>(basePoint);
  const urlStateRef = useRef(urlState);

  useEffect(() => {
    liveStateRef.current = liveState;
    committedStateRef.current = committedState;
    basePointRef.current = basePoint;
    urlStateRef.current = urlState;
  }, [liveState, committedState, committedMapState, basePoint, urlState]);

  const buildTransitionContext = useCallback((): SearchTransitionContext => {
    const currentState = mergeSnapshots(committedStateRef.current, liveStateRef.current);
    return {
      refPointFromBase: currentState.refPoint ?? basePointRef.current ?? null,
    };
  }, []);

  const dispatch = useCallback(
    (event: SearchEvent, options?: DispatchOptions) => {
      /**
       * liveState ↔ urlState 동기화 규칙
       * - dispatch는 항상 liveState를 갱신한다.
       * - map/search 변화가 있으면 urlState에 반영한다.
       * - urlState 변경은 URL_SYNC로 유입되어 liveState를 다시 맞춘다.
       */
      const prevSearch = committedStateRef.current;
      const prevMap = liveStateRef.current;
      const prevState = mergeSnapshots(prevSearch, prevMap);
      const ctx = buildTransitionContext();
      const next = transition(prevState, event, ctx);

      // 로컬 상태 즉시 업데이트
      const nextSearch = pickSearchSnapshot(next);
      const nextMap = pickMapSnapshot(next);
      setLiveState(nextMap);
      // 연속 이벤트에서도 최신 map 상태를 즉시 참조하도록 업데이트한다.
      liveStateRef.current = nextMap;

      const isSearchChanged =
        nextSearch.scope !== prevSearch.scope ||
        nextSearch.searchedLevel !== prevSearch.searchedLevel ||
        nextSearch.query !== prevSearch.query ||
        !isEqualFilters(nextSearch.filters, prevSearch.filters) ||
        !isEqualCoord(nextSearch.refPoint, prevSearch.refPoint) ||
        !isEqualBounds(nextSearch.searchBounds, prevSearch.searchBounds) ||
        nextSearch.searchLock !== prevSearch.searchLock ||
        !isEqualCoord(nextSearch.searchCenter, prevSearch.searchCenter);

      const isMapChanged =
        nextMap.zoom !== prevMap.zoom ||
        !isEqualCoord(nextMap.center, prevMap.center) ||
        !isEqualBounds(nextMap.viewportBounds, prevMap.viewportBounds);

      const shouldCommitMap = isSearchChanged;

      if (isSearchChanged) {
        setCommittedState(nextSearch);
        // URL_SYNC 직후 들어오는 이벤트가 최신 검색 상태를 사용하도록 보장한다.
        committedStateRef.current = nextSearch;
      }

      if (shouldCommitMap) {
        setCommittedMapState(nextMap);
      }

      if ((isSearchChanged || isMapChanged) && !options?.skipUrlSync) {
        const nextComparable = toComparableState(next);
        const urlComparable = normalizeUrlState(urlStateRef.current);
        if (!areComparableStatesEqual(nextComparable, urlComparable)) {
          setUrlState(next);
        }
      }
    },
    [buildTransitionContext, setUrlState]
  );

  const prevBaseTypeRef = useRef(baseType);
  useEffect(() => {
    if (!basePoint) return;

    if (!committedState.refPoint) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
      prevBaseTypeRef.current = baseType;
      return;
    }

    const baseTypeChanged = prevBaseTypeRef.current !== baseType;
    if (baseTypeChanged && !isEqualCoord(committedState.refPoint, basePoint)) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
    }
    prevBaseTypeRef.current = baseType;
  }, [basePoint, baseType, committedState.refPoint?.lat, committedState.refPoint?.lng, dispatch]);

  useEffect(() => {
    /**
     * URL 변경(뒤로가기/외부 진입)을 FSM으로 흡수한다.
     * URL_SYNC는 urlState를 다시 쓰지 않고 liveState를 재정렬한다.
     */
    const urlComparable = normalizeUrlState(urlState);
    const committedComparable = toComparableState(mergeSnapshots(committedStateRef.current, liveStateRef.current));
    if (areComparableStatesEqual(urlComparable, committedComparable)) {
      return;
    }

    const refPointFromBase = basePointRef.current ?? null;
    const baseState = buildUrlSyncState(urlState, refPointFromBase);
    const payloadState = {
      ...baseState,
      viewportBounds: liveStateRef.current.viewportBounds,
    };
    // URL 입력은 FSM으로 반영하되, URL 재동기화는 건너뜁니다.
    dispatch({ type: 'URL_SYNC', payload: payloadState }, { skipUrlSync: true });
  }, [dispatch, urlState]);

  const searchState = useMemo(
    () => mergeSnapshots(committedState, committedMapState),
    [committedState, committedMapState]
  );

  const value = useMemo<SearchMachineContextValue>(
    () => ({
      liveState,
      committedState,
      searchState,
      dispatch,
    }),
    [liveState, committedState, searchState, dispatch]
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

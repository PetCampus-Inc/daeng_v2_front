import {
  areComparableStatesEqual,
  buildUrlSyncState,
  normalizeUrlState,
  toComparableState,
  type SearchEvent,
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
  liveState: SearchState;
  committedState: SearchState;
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
  const [committedState, setCommittedState] = useState<SearchState>(createInitialState);
  const [liveState, setLiveState] = useState<SearchState>(createInitialState);

  const stateRef = useRef(liveState);
  const committedStateRef = useRef(committedState);
  const basePointRef = useRef<Coord | null>(basePoint);
  const urlStateRef = useRef(urlState);

  useEffect(() => {
    stateRef.current = liveState;
    committedStateRef.current = committedState;
    basePointRef.current = basePoint;
    urlStateRef.current = urlState;
  }, [liveState, committedState, basePoint, urlState]);

  const buildTransitionContext = useCallback((): SearchTransitionContext => {
    const currentState = stateRef.current;
    return {
      refPointFromBase: currentState.refPoint ?? basePointRef.current ?? null,
    };
  }, []);

  const dispatch = useCallback(
    (event: SearchEvent, options?: DispatchOptions) => {
      const prev = stateRef.current;
      const ctx = buildTransitionContext();
      const baseState = event.type === 'URL_SYNC' ? event.payload : prev;

      const next = transition(baseState, event, ctx);

      // 로컬 상태 즉시 업데이트
      setLiveState(next);

      const isStateChanged =
        next.scope !== prev.scope ||
        next.searchedLevel !== prev.searchedLevel ||
        next.query !== prev.query ||
        !isEqualFilters(next.filters, prev.filters) ||
        !isEqualCoord(next.refPoint, prev.refPoint) ||
        !isEqualBounds(next.searchBounds, prev.searchBounds) ||
        next.searchLock !== prev.searchLock ||
        !isEqualCoord(next.searchCenter, prev.searchCenter);

      if (isStateChanged) {
        console.log('[SearchMachine] State changed:', { event, prev, next });
        setCommittedState(next);
        if (!options?.skipUrlSync) {
          const nextComparable = toComparableState(next);
          const urlComparable = normalizeUrlState(urlStateRef.current);
          if (!areComparableStatesEqual(nextComparable, urlComparable)) {
            setUrlState(next);
          }
        }
      }
    },
    [buildTransitionContext, setUrlState]
  );

  const prevBaseTypeRef = useRef(baseType);
  useEffect(() => {
    if (!basePoint) return;

    if (!liveState.refPoint) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
      prevBaseTypeRef.current = baseType;
      return;
    }

    const baseTypeChanged = prevBaseTypeRef.current !== baseType;
    if (baseTypeChanged && !isEqualCoord(liveState.refPoint, basePoint)) {
      dispatch({ type: 'REFPOINT_SET', refPoint: basePoint });
    }
    prevBaseTypeRef.current = baseType;
  }, [basePoint, baseType, liveState.refPoint?.lat, liveState.refPoint?.lng, dispatch]);

  useEffect(() => {
    const urlComparable = normalizeUrlState(urlState);
    const committedComparable = toComparableState(committedStateRef.current);
    if (areComparableStatesEqual(urlComparable, committedComparable)) {
      return;
    }

    const refPointFromBase = basePointRef.current ?? null;
    const baseState = buildUrlSyncState(urlState, refPointFromBase);
    // URL 입력은 FSM으로 반영하되, URL 재동기화는 건너뜁니다.
    dispatch({ type: 'URL_SYNC', payload: baseState }, { skipUrlSync: true });
  }, [dispatch, urlState]);

  const value = useMemo<SearchMachineContextValue>(
    () => ({
      liveState,
      committedState,
      dispatch,
    }),
    [liveState, committedState, dispatch]
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

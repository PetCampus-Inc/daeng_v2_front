import { type SearchEvent, type SearchState, type SearchTransitionContext, transition } from '../lib/searchMachine';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchUrlState } from './useSearchUrlState';
import { isEqualFilters } from '@entities/kindergarten';
import { isEqualBounds, isEqualCoord, useBasePoint } from '@shared/lib';
import type { Coord } from '@shared/types';

interface SearchMachineContextValue {
  liveState: SearchState;
  committedState: SearchState;
  dispatch: (event: SearchEvent) => void;
}

const SearchMachineContext = createContext<SearchMachineContextValue | null>(null);

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const { coord: basePoint, type: baseType } = useBasePoint();

  const { state: committedState, commitState } = useSearchUrlState();
  const [liveState, setLiveState] = useState<SearchState>(committedState);

  // URL이 외부 요인(뒤로가기 등)으로 변경되면 로컬 liveState와 동기화
  useEffect(() => {
    setLiveState(committedState);
  }, [committedState]);

  const stateRef = useRef(liveState);
  const commitStateRef = useRef(commitState);
  const basePointRef = useRef<Coord | null>(basePoint);

  useEffect(() => {
    stateRef.current = liveState;
    commitStateRef.current = commitState;
    basePointRef.current = basePoint;
  }, [liveState, commitState, basePoint]);

  const buildTransitionContext = useCallback((): SearchTransitionContext => {
    const currentState = stateRef.current;
    return {
      refPointFromBase: currentState.refPoint ?? basePointRef.current ?? null,
    };
  }, []);

  const dispatch = useCallback(
    (event: SearchEvent) => {
      const prev = stateRef.current;
      const ctx = buildTransitionContext();

      const next = transition(prev, event, ctx);

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
        !isEqualCoord(next.center, prev.center) ||
        next.zoom !== prev.zoom;

      if (isStateChanged) {
        commitStateRef.current(next);
      }
    },
    [buildTransitionContext]
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
  }, [basePoint, baseType, liveState.refPoint, dispatch]);

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

import {
  type ApiCallDecision,
  type SchoolResult,
  type SearchEvent,
  type SearchState,
  resolveApiCallsOnViewportChange,
  transition,
} from '../lib/searchState';
import { DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { getRegionLevel } from '../lib/markers';
import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from 'react';

interface SearchStateContextValue {
  state: SearchState;
  decision: ApiCallDecision;
  hasResponse: boolean;
  dispatch: (event: SearchEvent) => void;
  sendNewSearch: (scope: Exclude<SearchState['scope'], 'boundary'>) => void;
  sendResultResolved: (schoolResult: SchoolResult) => void;
  sendZoomChanged: (zoomLevel: number) => void;
  sendRefreshHere: () => void;
}

const SearchStateContext = createContext<SearchStateContextValue | null>(null);

export function SearchStateProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(transition, {
    scope: 'global',
    fetchPolicy: 'full',
    resultKind: 'empty',
    zoomLevel: DEFAULT_MAP_ZOOM_LEVEL,
    regionLevel: getRegionLevel(DEFAULT_MAP_ZOOM_LEVEL),
  } satisfies SearchState);

  // "이번 검색 사이클의 첫 응답인지" 플래그
  const [hasResponse, setHasResponse] = useState(false);

  const dispatch = useCallback(
    (event: SearchEvent) => {
      if (event.type === 'NEW_SEARCH' || event.type === 'REFRESH_HERE') {
        setHasResponse(false);
      } else if (event.type === 'RESULT_RESOLVED') {
        setHasResponse(true);
      }
      rawDispatch(event);
    },
    [rawDispatch]
  );

  const decision: ApiCallDecision = useMemo(() => {
    // 이번 검색 사이클의 첫 요청
    if (!hasResponse) {
      return { callList: true, callAgg: true };
    }
    return resolveApiCallsOnViewportChange(state);
  }, [state, hasResponse]);

  const sendNewSearch = useCallback(
    (scope: Exclude<SearchState['scope'], 'boundary'>) => {
      dispatch({ type: 'NEW_SEARCH', scope });
    },
    [dispatch]
  );

  const sendResultResolved = useCallback(
    (schoolResult: SchoolResult) => {
      dispatch({ type: 'RESULT_RESOLVED', schoolResult });
    },
    [dispatch]
  );

  const sendZoomChanged = useCallback(
    (zoomLevel: number) => {
      dispatch({ type: 'ZOOM_CHANGED', zoomLevel });
    },
    [dispatch]
  );

  const sendRefreshHere = useCallback(() => {
    dispatch({ type: 'REFRESH_HERE' });
  }, [dispatch]);

  const value = useMemo<SearchStateContextValue>(
    () => ({
      state,
      decision,
      hasResponse,
      dispatch,
      sendNewSearch,
      sendResultResolved,
      sendZoomChanged,
      sendRefreshHere,
    }),
    [state, decision, hasResponse, dispatch, sendNewSearch, sendResultResolved, sendZoomChanged, sendRefreshHere]
  );

  return <SearchStateContext.Provider value={value}>{children}</SearchStateContext.Provider>;
}

export function useSearchState(): SearchStateContextValue {
  const context = useContext(SearchStateContext);
  if (!context) {
    throw new Error('useSearchState는 SearchStateProvider 하위에서만 사용할 수 있습니다.');
  }
  return context;
}

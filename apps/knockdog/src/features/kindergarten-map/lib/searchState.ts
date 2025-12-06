import { getRegionLevel } from './markers';
import type { KindergartenListWithMeta } from '@entities/kindergarten';

/**
 * ─────────────────────────────────────────────
 * 1. 타입 정의
 * ─────────────────────────────────────────────
 */

export type SearchScope = 'global' | 'nearby' | 'boundary';

export type FetchPolicy =
  | 'static' // EP-01: boundary 진입 후 줌/이동으로는 아무 호출도 안 함
  | 'agg-only' // EP-02: boundary 진입 후 줌/이동 시 agg만 호출
  | 'full'; // global / nearby 기본 모드에서 L3 진입 시 list+agg 허용

export type ResultKind = 'empty' | 'single' | 'multi';

export interface Coord {
  lat: number;
  lng: number;
}

export type SchoolResult = KindergartenListWithMeta['schoolResult'];

export interface SearchState {
  scope: SearchScope;
  fetchPolicy: FetchPolicy;
  resultKind: ResultKind;
  zoomLevel: number;
  regionLevel: 1 | 2 | 3;
}

/**
 * ─────────────────────────────────────────────
 * 2. 이벤트 정의
 * ─────────────────────────────────────────────
 */

export type SearchEvent =
  // 새 검색 시작 (쿼리/필터/지역/nearby 토글 변경)
  // EP-02도 최종적으로는 NEW_SEARCH('boundary')로 취급 가능
  | { type: 'NEW_SEARCH'; scope: Exclude<SearchScope, 'boundary'> }
  // map-view 응답 도착 → 단일/다건/0건 판정
  | { type: 'RESULT_RESOLVED'; schoolResult: SchoolResult }
  // 줌/이동으로 zoomLevel 변경
  | { type: 'ZOOM_CHANGED'; zoomLevel: number }
  // EP-01: “현 위치에서 재검색” 버튼
  | { type: 'REFRESH_HERE' };

/**
 * ─────────────────────────────────────────────
 * 3. Helper
 * ─────────────────────────────────────────────
 */

export function deriveResultKind(schoolResult: SchoolResult): ResultKind {
  if (schoolResult.totalCount === 0) return 'empty';
  if (schoolResult.exact != null) return 'single';
  return 'multi';
}

/**
 * EP-01: 버튼 기반 바운더리 진입 (“현 위치에서 재검색”)
 *
 * - scope: boundary
 * - fetchPolicy: static
 * - boundaryJustEntered: false (버튼 클릭 시점에 list+agg를 따로 호출)
 */
export function enterBoundaryByButton(prev: SearchState): SearchState {
  return {
    ...prev,
    scope: 'boundary',
    fetchPolicy: 'static',
  };
}

/**
 * EP-02: global → boundary 자동 전환
 *
 * 조건:
 * - prev.scope === 'global'
 * - prev.resultKind === 'multi'
 * - prev.regionLevel === 3 (읍/면/동)
 *
 * 동작:
 * - scope: boundary
 * - fetchPolicy: agg-only
 */
export function maybeEnterBoundaryByZoom(prev: SearchState): SearchState {
  if (prev.scope !== 'global') {
    return { ...prev };
  }

  if (prev.resultKind !== 'multi') {
    return { ...prev };
  }

  if (prev.regionLevel !== 3) {
    return { ...prev };
  }

  return {
    ...prev,
    scope: 'boundary',
    fetchPolicy: 'agg-only',
  };
}

/**
 * ─────────────────────────────────────────────
 * 4. 상태 전이 코어
 * ─────────────────────────────────────────────
 */
export function transition(prev: SearchState, event: SearchEvent): SearchState {
  switch (event.type) {
    case 'NEW_SEARCH': {
      // scope에 따라 fetchPolicy 기본값 설정
      // - global / nearby: full
      // - boundary(EP-02): full → 응답 도착 후 agg-only로 바뀜
      return {
        ...prev,
        scope: event.scope,
        fetchPolicy: 'full',
        resultKind: 'empty', // 응답 전
      };
    }

    case 'RESULT_RESOLVED': {
      const resultKind = deriveResultKind(event.schoolResult);

      let nextFetchPolicy = prev.fetchPolicy;

      // EP-02: boundary로 NEW_SEARCH 후 첫 응답이 들어온 시점
      // → 이후부터는 agg-only로 동작
      if (prev.scope === 'boundary' && prev.fetchPolicy === 'full') {
        nextFetchPolicy = 'agg-only';
      }

      return {
        ...prev,
        resultKind,
        fetchPolicy: nextFetchPolicy,
      };
    }

    case 'ZOOM_CHANGED': {
      const zoomLevel = event.zoomLevel;
      const regionLevel = getRegionLevel(zoomLevel);

      return {
        ...prev,
        zoomLevel,
        regionLevel,
      };
    }

    case 'REFRESH_HERE': {
      // EP-01: 버튼 기반 boundary 진입
      // - scope: boundary
      // - fetchPolicy: static
      // - resultKind는 그대로 (어차피 NEW_SEARCH처럼 hasResponse를 리셋해 버림)
      return {
        ...prev,
        scope: 'boundary',
        fetchPolicy: 'static',
      };
    }

    default:
      return prev;
  }
}

/**
 * ─────────────────────────────────────────────
 * 5. API 호출 결정 유틸
 * ─────────────────────────────────────────────
 */

export interface ApiCallDecision {
  callList: boolean;
  callAgg: boolean;
}

/**
 * 뷰포트 변경(줌/이동) 이후 list / agg 중 무엇을 호출할지 결정
 *
 * - viewport 변경 직후, React Query enabled 조건에만 사용
 * - "최초 검색 전" 케이스는 Provider에서 hasResponse로 따로 처리
 */
export function resolveApiCallsOnViewportChange(state: SearchState): ApiCallDecision {
  console.log('state', state);
  // 1) boundary 스코프 (EP-01 / EP-02)

  if (state.scope === 'boundary') {
    if (state.fetchPolicy === 'static') {
      // EP-01: 현 위치 재검색 이후 → 줌/이동으로는 재조회 금지
      return { callList: false, callAgg: false };
    }

    if (state.fetchPolicy === 'agg-only') {
      // EP-02: boundary 모드 → 줌/이동 시 agg만
      return { callList: false, callAgg: true };
    }

    // boundary + full 상태는
    // - NEW_SEARCH 직후 응답 오기 전 (hasResponse=false 구간)에서만 의미 있음
    // - hasResponse=false일 땐 Context에서 list+agg를 이미 강제로 켜므로
    // 여기서는 보호 차원에서 agg-only로 둔다
    return { callList: false, callAgg: true };
  }

  // 2) global / nearby 공통 로직

  // 결과 0건 → 자동으로 다시 안 부름
  if (state.resultKind === 'empty') {
    return { callList: false, callAgg: false };
  }

  // 단일건 → list는 더 안 부르고 agg만
  if (state.resultKind === 'single') {
    return { callList: false, callAgg: true };
  }

  // 다건 + nearby/global 기본 정책 (fetchPolicy = full)

  if (state.fetchPolicy === 'full') {
    if (state.regionLevel === 3) {
      // L3(읍면동) 레벨에서 재진입 → "내주변 기본", "전체 기본" 정책
      // → list+agg 재호출
      return { callList: true, callAgg: true };
    }

    // L1/L2에서는 집계만
    return { callList: false, callAgg: true };
  }

  // 이 밖의 조합은 안전하게 agg-only
  return { callList: false, callAgg: true };
}

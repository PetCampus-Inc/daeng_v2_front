// TODO: 실제 기본 좌표로 변경 필요!!
export const DEFAULT_MAP_CENTER = { lat: 37.54, lng: 127.07 } as const;

export const DEFAULT_MAP_ZOOM_LEVEL = 15;

/**
 * 줌레벨별 행정구역 단위
 */
export const REGION_LEVELS = {
  1: { name: 'SIDO', min: 0, max: 10 }, // 광역시/도: ~10
  2: { name: 'SIGUNGU', min: 11, max: 13 }, // 시/군/구: 11~13
  3: { name: 'EUPMYEONDONG', min: 14, max: 20 }, // 읍/면/동: 14~
} as const;

/**
 * 마커 표시 임계값
 */
export const MARKER_THRESHOLDS = {
  /** 집계 마커 최대 줌레벨 (0~13) */
  AGGREGATION_MAX: REGION_LEVELS[2].max,
  /** 업체 마커 최소 줌레벨 (14~) */
  BUSINESS_MIN: REGION_LEVELS[3].min,
} as const;

/**
 * 지도 검색 모드 상수
 */
export const SEARCH_MODES = {
  NEARBY: 'nearby',
  BOUNDARY: 'boundary',
} as const;

export const DEFAULT_SEARCH_MODE = SEARCH_MODES.NEARBY;

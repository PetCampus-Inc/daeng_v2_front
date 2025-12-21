export const DEFAULT_DISTANCE = 1;

// TODO: 실제 기본 좌표로 변경 필요!!
export const DEFAULT_MAP_CENTER = { lat: 37.54, lng: 127.07 } as const;

export const DEFAULT_MAP_ZOOM_LEVEL = 15;

/**
 * 검색 스코프
 */
export const SEARCH_SCOPE = {
  NEARBY: 'nearby',
  BOUNDARY: 'bounds',
  GLOBAL: 'global',
} as const;

export type SearchScope = (typeof SEARCH_SCOPE)[keyof typeof SEARCH_SCOPE];

/**
 * 줌레벨별 행정구역 단위
 */
export const REGION_LEVELS = {
  1: { name: 'SIDO', min: 0, max: 10 }, // 광역시/도: ~10
  2: { name: 'SIGUNGU', min: 11, max: 12 }, // 시/군/구: 11~12
  3: { name: 'EUPMYEONDONG', min: 13, max: 20 }, // 읍/면/동: 13~
} as const;

export type RegionLevel = keyof typeof REGION_LEVELS;

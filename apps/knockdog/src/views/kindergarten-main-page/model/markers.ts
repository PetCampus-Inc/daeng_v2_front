/**
 * 지도 마커 표시 규칙 및 줌레벨 정책
 */

/**
 * 줌레벨별 행정구역 단위
 */
export const REGION_LEVELS = {
  1: { name: 'SIDO', min: 0, max: 10 }, // 광역시/도: ~10
  2: { name: 'SIGUNGU', min: 11, max: 13 }, // 시/군/구: 11~13
  3: { name: 'EUPMYEONDONG', min: 14, max: 20 }, // 읍/면/동: 14~
} as const;

export type RegionLevel = keyof typeof REGION_LEVELS;

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
 * 줌레벨에 따른 행정구역 단위 반환
 */
export const getRegionLevel = (zoomLevel: number): RegionLevel => {
  if (zoomLevel <= REGION_LEVELS[1].max) return 1;
  if (zoomLevel <= REGION_LEVELS[2].max) return 2;
  return 3;
};

/**
 * 집계 마커 표시 여부
 */
export const isAggregationZoom = (zoomLevel: number): boolean => {
  return zoomLevel <= MARKER_THRESHOLDS.AGGREGATION_MAX;
};

/**
 * 업체 마커 표시 여부  
 */
export const isBusinessZoom = (zoomLevel: number): boolean => {
  return zoomLevel >= MARKER_THRESHOLDS.BUSINESS_MIN;
};

/**
 * 행정구역 단위명 반환
 */
export const getRegionName = (region: RegionLevel): string => {
  return REGION_LEVELS[region].name;
};

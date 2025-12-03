import { MARKER_THRESHOLDS, REGION_LEVELS } from '../config/map';
type RegionLevel = keyof typeof REGION_LEVELS;

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

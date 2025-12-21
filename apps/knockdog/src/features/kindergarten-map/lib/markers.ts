import { REGION_LEVELS, type RegionLevel } from '../config/map';

/**
 * 줌레벨에 따른 행정구역 단위 반환
 */
export const getRegionLevel = (zoomLevel: number): RegionLevel => {
  if (zoomLevel <= REGION_LEVELS[1].max) return 1;
  if (zoomLevel <= REGION_LEVELS[2].max) return 2;
  return 3;
};

/**
 * 마커 렌더 임계값
 */
const MARKER_THRESHOLDS = {
  /** low level(집계) 최대 줌레벨 (0~12) */
  LOW_LEVEL_MAX: REGION_LEVELS[2].max,
  /** medium level(일반) 최소 줌레벨 (13~14) */
  MEDIUM_LEVEL_MIN: REGION_LEVELS[3].min,
  /** high level(클러스터) 최소 줌레벨 (15~) */
  HIGH_LEVEL_MIN: 15,
} as const;

/**
 * 집계 마커 표시 여부
 */
export const isAggregationZoom = (zoomLevel: number): boolean => {
  return zoomLevel <= MARKER_THRESHOLDS.LOW_LEVEL_MAX;
};

/**
 * 개별 마커(일반) 표시 여부
 */
export const isPointZoom = (zoomLevel: number): boolean => {
  return zoomLevel >= MARKER_THRESHOLDS.MEDIUM_LEVEL_MIN;
};

/**
 * 클러스터링 적용 줌 레벨
 */
export const isClusteringZoom = (zoomLevel: number): boolean => {
  return zoomLevel >= MARKER_THRESHOLDS.HIGH_LEVEL_MIN;
};

/**
 * 행정구역 단위명 반환
 */
export const getRegionName = (region: RegionLevel): string => {
  return REGION_LEVELS[region].name;
};

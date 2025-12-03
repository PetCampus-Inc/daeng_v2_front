import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM_LEVEL } from '../config/map';
import { isValidCoord } from '@shared/lib';
import type { Coord } from '@shared/types';

interface GetMapCenterParams {
  center: Coord | null;
  basePoint?: Coord;
}

/**
 * 지도 center 계산
 * 우선순위: URL center > basePoint > DEFAULT
 */
export function getMapCenter({ center, basePoint }: GetMapCenterParams): Coord {
  if (isValidCoord(center)) return center;
  if (isValidCoord(basePoint)) return basePoint;
  return DEFAULT_MAP_CENTER;
}

/**
 * 지도 zoom 계산
 * 우선순위: URL zoom > DEFAULT
 */
export function getMapZoom(zoomLevel: number | null): number {
  return zoomLevel ?? DEFAULT_MAP_ZOOM_LEVEL;
}

import { DistanceInfo } from '@entities/bookmark';
import { ReferencePointType } from '@entities/compare';

/** 기준 지점(refPoint)에 해당하는 거리 정보를 찾습니다. */
function findDistanceByRefPoint(distances: DistanceInfo[], refPoint: ReferencePointType): DistanceInfo | undefined {
  return distances.find((d) => d.referencePoint === refPoint);
}

/** 거리 문자열을 km 단위 숫자로 파싱합니다. */
function parseDistanceToKm(distance: string): number {
  const match = distance.match(/[\d.]+/);
  if (!match) {
    return Infinity;
  }
  return Number.parseFloat(match[0]);
}

export { findDistanceByRefPoint, parseDistanceToKm };

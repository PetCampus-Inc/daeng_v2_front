import { extractDistance } from '@entities/compare/lib/utils';
import { createDistanceComparison } from './createDistanceComparison';
import {
  KindergartenComparison,
  DistanceComparisonsByRef,
  ReferencePointType,
  TransportationType,
} from '@entities/compare/model/types';

/**
 * 두 유치원의 거리 데이터를 기반으로 위치별로 그룹화된 거리 비교를 생성합니다.
 *
 * @param left - 왼쪽 유치원 데이터
 * @param right - 오른쪽 유치원 데이터
 * @returns 위치별로 그룹화된 거리 비교 객체 { [refPoint]: { [transportType]: comparison } }
 */
export function createDistanceComparisonsByRef(
  left: KindergartenComparison,
  right: KindergartenComparison
): DistanceComparisonsByRef {
  const refPoints = new Set<ReferencePointType>();
  [...left.distance, ...right.distance].forEach((distanceInfo) => {
    refPoints.add(distanceInfo.referencePoint);
  });

  const transportTypes = new Set<TransportationType>();
  [...left.distance, ...right.distance].forEach((distanceInfo) => {
    distanceInfo.transitTimes.forEach((transit) => {
      transportTypes.add(transit.type);
    });
  });

  const comparisons: DistanceComparisonsByRef = {};

  refPoints.forEach((refPoint) => {
    comparisons[refPoint] = {};

    transportTypes.forEach((transportType) => {
      const comparison = createDistanceComparison(left, right, extractDistance(refPoint, transportType));
      comparisons[refPoint]![transportType] = comparison;
    });
  });

  return comparisons;
}

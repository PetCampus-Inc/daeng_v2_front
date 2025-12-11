import { createDistanceComparison } from './createDistanceComparison';
import { getTransitTime, parseTimeStrToMinutes } from '@entities/compare/lib/utils';
import {
  KindergartenComparison,
  DistanceComparisonsByRef,
  ReferencePointType,
  TransportationType,
  DistanceComparisonsByTransport,
  DistanceDetailComparison,
  REFERENCE_POINT_TYPE,
  TRANSPORTATION_TYPE,
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
  const refPoints = Object.keys(REFERENCE_POINT_TYPE) as ReferencePointType[];
  const transportTypes = Object.keys(TRANSPORTATION_TYPE) as TransportationType[];

  const comparisonsByRef: DistanceComparisonsByRef = {};

  refPoints.forEach((refPoint) => {
    const comparisonsBytransport: DistanceComparisonsByTransport = {};

    transportTypes.forEach((transportType) => {
      const comparison: DistanceDetailComparison = createDistanceComparison(
        left,
        right,
        (kg) => parseTimeStrToMinutes(getTransitTime(kg, refPoint, transportType)) // TODO: api 수정 후 parseTimeStrToMinutes 메서드 삭제
      );
      comparisonsBytransport[transportType] = comparison;
    });
    comparisonsByRef[refPoint] = comparisonsBytransport;
  });

  return comparisonsByRef;
}

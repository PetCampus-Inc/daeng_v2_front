import { createDistanceComparison } from './createDistanceComparison';
import type {
  KindergartenComparison,
  ReferencePointType,
  TransportationType,
  DistanceComparisonsByTransport,
  DistanceDetailComparison,
} from '@entities/compare';
import { getTransitTime, parseTimeStrToMinutes, TRANSPORTATION_TYPE } from '@entities/compare';

export function compareDistancesByTransport(
  left: KindergartenComparison,
  right: KindergartenComparison,
  refPoint: ReferencePointType
): DistanceComparisonsByTransport {
  const transportTypes = Object.keys(TRANSPORTATION_TYPE) as TransportationType[];

  return transportTypes.reduce((acc, transportType) => {
    const comparison: DistanceDetailComparison = createDistanceComparison(
      left,
      right,
      (kg) => parseTimeStrToMinutes(getTransitTime(kg, refPoint, transportType)) // TODO: api 수정 후 parseTimeStrToMinutes 메서드 삭제
    );
    acc[transportType] = comparison;
    return acc;
  }, {} as DistanceComparisonsByTransport);
}

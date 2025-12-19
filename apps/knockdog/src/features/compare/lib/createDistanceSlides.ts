import type { KindergartenComparison, SlideProps, TransportationType } from '@entities/compare';
import { getTransitTime, getDistanceString, REFERENCE_POINT_TYPE, TRANSPORTATION_TYPE } from '@entities/compare';
import { getDirectionParticle } from '@shared/utils';

export function createDistanceSlides(
  left: KindergartenComparison | null,
  right: KindergartenComparison | null
): SlideProps[] {
  return Object.entries(REFERENCE_POINT_TYPE).map(([refPoint, refPointLabel]) => {
    const directionParticle = getDirectionParticle(refPointLabel);

    const transportRows = Object.entries(TRANSPORTATION_TYPE).map(([transportType, transportTypeLabel]) => ({
      label: transportTypeLabel,
      left: { value: getTransitTime(left, refPoint, transportType as TransportationType) },
      right: { value: getTransitTime(right, refPoint, transportType as TransportationType) },
    }));

    const distanceRow = {
      label: '거리',
      left: { value: getDistanceString(left, refPoint) },
      right: { value: getDistanceString(right, refPoint) },
    };

    return {
      type: `${refPointLabel}${directionParticle}부터`,
      rows: [...transportRows, distanceRow],
    };
  });
}

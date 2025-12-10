import {
  ReferencePointType,
  TransportationType,
  DistanceComparisonsByRef,
  DistanceDetailComparison,
  DetailComparisonItem,
} from '@entities/compare';

interface ShortestInfo extends DetailComparisonItem {
  referencePoint: ReferencePointType;
  transportType: TransportationType;
}

export function findShortestFromComparisons(comparisons: DistanceComparisonsByRef): ShortestInfo | null {
  let shortest: ShortestInfo | null = null;

  for (const [refPoint, transportMap] of Object.entries(comparisons)) {
    for (const [transportType, comparison] of Object.entries(transportMap)) {
      if (!comparison) continue;

      const { variant, leftKg } = comparison as DistanceDetailComparison;

      if (variant === 'closer' || variant === 'equal') {
        if (!shortest || leftKg.value < shortest.value) {
          shortest = {
            name: leftKg.name,
            avatar: leftKg.avatar,
            value: leftKg.value,
            referencePoint: refPoint as ReferencePointType,
            transportType: transportType as TransportationType,
          };
        }
      }
    }
  }

  return shortest;
}

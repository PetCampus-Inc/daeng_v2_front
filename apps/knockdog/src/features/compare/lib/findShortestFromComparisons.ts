import {
  ReferencePointType,
  TransportationType,
  DistanceComparisonsByRef,
  DistanceDetailComparison,
} from '@entities/compare';

type ShortestInfo = {
  kindergartenName: string;
  referencePoint: ReferencePointType;
  transportType: TransportationType;
  minutes: number;
};

export function findShortestFromComparisons(comparisons: DistanceComparisonsByRef): ShortestInfo | null {
  let shortest: ShortestInfo | null = null;

  for (const [refPoint, transportMap] of Object.entries(comparisons)) {
    for (const [transportType, comparison] of Object.entries(transportMap)) {
      const { variant, leftKg } = comparison as DistanceDetailComparison;

      if (variant === 'closer' || variant === 'equal') {
        if (!shortest || leftKg.minutes < shortest.minutes) {
          shortest = {
            kindergartenName: leftKg.name,
            referencePoint: refPoint as ReferencePointType,
            transportType: transportType as TransportationType,
            minutes: leftKg.minutes,
          };
        }
      }
    }
  }

  return shortest;
}

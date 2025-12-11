import { DistanceDetailedItem } from './DistanceDetailedItem';
import { createDistanceComparisonsByRef } from '../lib/createDistanceComparisonsByRef';
import { DistanceSummary } from './DistanceSummary';
import type {
  KindergartenComparison,
  TransportationType,
  ReferencePointType,
  DistanceComparisonsByRef,
  DistanceComparisonsByTransport,
} from '@entities/compare';
import { TRANSPORTATION_TYPE, Label, Badge } from '@entities/compare';

export function DistanceSection({
  left,
  right,
  referencePoint = 'HOME',
}: {
  left: KindergartenComparison;
  right: KindergartenComparison;
  referencePoint?: ReferencePointType;
}) {
  const allDistanceComparisons: DistanceComparisonsByRef = createDistanceComparisonsByRef(left, right);
  const selectedDistanceComparison: DistanceComparisonsByTransport = allDistanceComparisons[referencePoint] ?? {};

  const comparisonItems = Object.entries(selectedDistanceComparison).map(([transportType, comparison]) => ({
    transportType: transportType as TransportationType,
    comparison,
  }));

  return (
    <>
      <Label className='mb-2'>거리</Label>
      <DistanceSummary comparisons={allDistanceComparisons} />
      <div className='mt-7 flex flex-col gap-5'>
        {comparisonItems.map(({ transportType, comparison }) => (
          <DistanceDetailedItem
            key={transportType}
            comparison={comparison}
            badge={<Badge icon={'Walk'}>{TRANSPORTATION_TYPE[transportType] ?? transportType}</Badge>}
          />
        ))}
      </div>
    </>
  );
}

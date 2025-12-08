import { DistanceDetailedItem } from './DistanceDetailedItem';
import { Label, DistanceSummary, Badge } from '@entities/compare';
import { TransportationType, TRANSPORTATION_TYPE, DistanceComparisonsByRef } from '@entities/compare/model/types';

export function DistanceSection({
  distanceComparisons,
  referencePoint = 'HOME',
}: {
  distanceComparisons: DistanceComparisonsByRef;
  referencePoint?: string;
}) {
  const comparisonForSelectedRefPoint = distanceComparisons[referencePoint];

  const comparisonItems = Object.entries(comparisonForSelectedRefPoint ?? {})
    .filter(([_, comparison]) => comparison != null)
    .map(([transportType, comparison]) => ({
      transportType: transportType as TransportationType,
      comparison: comparison!,
    }));

  if (comparisonItems.length === 0) {
    return null;
  }

  return (
    <>
      <Label className='mb-2'>거리</Label>
      <DistanceSummary comparisons={distanceComparisons} />
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

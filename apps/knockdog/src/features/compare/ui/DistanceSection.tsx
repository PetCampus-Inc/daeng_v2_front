import { useState } from 'react';
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
import { TRANSPORTATION_TYPE, Label, Badge, REFERENCE_POINT_TYPE } from '@entities/compare';

const REFERENCE_POINT_OPTIONS = Object.entries(REFERENCE_POINT_TYPE).map(([value, label]) => ({
  value: value as ReferencePointType,
  label,
}));

export function DistanceSection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  const [referencePoint, setReferencePoint] = useState<ReferencePointType>('HOME');

  const allDistanceComparisons: DistanceComparisonsByRef = createDistanceComparisonsByRef(left, right);
  const selectedDistanceComparison: DistanceComparisonsByTransport = allDistanceComparisons[referencePoint] ?? {};

  const comparisonItems = Object.entries(selectedDistanceComparison).map(([transportType, comparison]) => ({
    transportType: transportType as TransportationType,
    comparison,
  }));

  return (
    <>
      <Label className='mb-2'>거리</Label>
      <DistanceSummary
        comparisons={allDistanceComparisons}
        referencePoint={referencePoint}
        referencePointOptions={REFERENCE_POINT_OPTIONS}
        onReferencePointChange={setReferencePoint}
      />
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

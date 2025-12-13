import { useState } from 'react';
import { DistanceDetailedItem } from './DistanceDetailedItem';
import { DistanceSummary } from './DistanceSummary';
import { compareDistancesByTransport } from '../lib/compareDistancesByTransport';
import { findShortestTransport } from '../lib/findShortestTransport';
import type { KindergartenComparison, TransportationType, ReferencePointType } from '@entities/compare';
import { TRANSPORTATION_TYPE, Label, Badge, REFERENCE_POINT_TYPE } from '@entities/compare';

const REFERENCE_POINT_OPTIONS = Object.entries(REFERENCE_POINT_TYPE).map(([value, label]) => ({
  value: value as ReferencePointType,
  label,
}));

export function DistanceSection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  const [referencePoint, setReferencePoint] = useState<ReferencePointType>('HOME');

  const comparisonsByTransport = compareDistancesByTransport(left, right, referencePoint);

  const shortestInfo = findShortestTransport(comparisonsByTransport);

  const comparisonItems = Object.entries(comparisonsByTransport).map(([transportType, comparison]) => ({
    transportType: transportType as TransportationType,
    comparison,
  }));

  return (
    <>
      <Label className='mb-2'>거리</Label>
      <DistanceSummary
        shortestInfo={shortestInfo}
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

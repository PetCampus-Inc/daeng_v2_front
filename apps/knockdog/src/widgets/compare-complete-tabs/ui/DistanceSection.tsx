import { useState } from 'react';
import {
  compareDistancesByTransport,
  findShortestTransport,
  DistanceSummary,
  DistanceDetailedItem,
} from '@features/compare';
import type { KindergartenComparison, TransportationType, ReferencePointType } from '@entities/compare';
import { TRANSPORTATION_TYPE, Label, Badge } from '@entities/compare';
import type { UserAddress } from '@entities/user';
import { useUserStore } from '@entities/user';

function DistanceSection({ left, right }: { left: KindergartenComparison; right: KindergartenComparison }) {
  const [referencePoint, setReferencePoint] = useState<ReferencePointType>('HOME');
  const user = useUserStore((state) => state.user);
  const savedAddresses = user?.addresses;

  const refPointOptions = (savedAddresses ?? [])
    .filter((addr): addr is UserAddress & { alias: string } => !!addr.alias)
    .map(({ type, alias }) => ({
      value: type as ReferencePointType,
      label: alias,
    }));

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
        referencePointOptions={refPointOptions}
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

export { DistanceSection };

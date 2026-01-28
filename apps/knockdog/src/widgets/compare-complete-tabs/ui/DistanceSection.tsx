import {
  compareDistancesByTransport,
  findShortestTransport,
  DistanceSummary,
  DistanceDetailedItem,
} from '@features/compare';
import type { KindergartenComparison, TransportationType, ReferencePointType } from '@entities/compare';
import { TRANSPORTATION_TYPE, TRANSPORTATION_ICON_MAP, Label, Badge } from '@entities/compare';

interface DistanceSectionProps {
  left: KindergartenComparison;
  right: KindergartenComparison;
  referencePoint: ReferencePointType;
  referencePointOptions: { value: ReferencePointType; label: string }[];
  onReferencePointChange: (value: ReferencePointType) => void;
}

function DistanceSection({ left, right, referencePoint, referencePointOptions, onReferencePointChange }: DistanceSectionProps) {

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
        maxLabelLength={referencePoint === 'OTHER' ? 6 : 5} // OTHER='공유된 위치' 길이 고려
        referencePoint={referencePoint}
        referencePointOptions={referencePointOptions}
        onReferencePointChange={onReferencePointChange}
      />
      <div className='mt-7 flex flex-col gap-5'>
        {comparisonItems.map(({ transportType, comparison }) => (
          <DistanceDetailedItem
            key={transportType}
            comparison={comparison}
            badge={
              <Badge icon={TRANSPORTATION_ICON_MAP[transportType]}>
                {TRANSPORTATION_TYPE[transportType] ?? transportType}
              </Badge>
            }
          />
        ))}
      </div>
    </>
  );
}

export { DistanceSection };

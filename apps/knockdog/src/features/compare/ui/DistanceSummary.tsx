import type { ReferencePointType, ShortestInfo } from '@entities/compare';
import { Summary, TRANSPORTATION_TYPE } from '@entities/compare';
import { Dropdown } from '@shared/ui/dropdown';
import { getDirectionParticle, getSubjectParticle } from '@shared/utils';

interface DistanceSummaryProps {
  shortestInfo: ShortestInfo;
  referencePointOptions: { value: ReferencePointType; label: string }[];
  referencePoint: ReferencePointType;
  maxLabelLength?: number;
  onReferencePointChange: (value: ReferencePointType) => void;
}

export function DistanceSummary({
  shortestInfo,
  referencePoint,
  referencePointOptions,
  maxLabelLength = 5,
  onReferencePointChange,
}: DistanceSummaryProps) {
  const transportTypeText = TRANSPORTATION_TYPE[shortestInfo.transportType];
  const subjectParticle = getSubjectParticle(shortestInfo.name);
  const directionParticle = getDirectionParticle(transportTypeText);

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Dropdown
          options={referencePointOptions}
          value={referencePoint}
          onChange={onReferencePointChange}
          maxLabelLength={maxLabelLength}
          triggerClassName='border-b p-0'
          labelClassName='h2-extrabold'
          iconClassName='text-text-primary'
        />
        <Summary highlight={shortestInfo.name} truncate>{`에서 ${shortestInfo.name}${subjectParticle}`}</Summary>
      </div>
      <Summary highlight={transportTypeText}>{`${transportTypeText}${directionParticle} 가장 가까워요`}</Summary>
    </>
  );
}

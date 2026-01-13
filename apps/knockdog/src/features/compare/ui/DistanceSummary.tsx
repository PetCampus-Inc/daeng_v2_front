import type { ReferencePointType, ShortestInfo } from '@entities/compare';
import { Dropdown, Summary, TRANSPORTATION_TYPE } from '@entities/compare';
import { getDirectionParticle, getSubjectParticle } from '@shared/utils';

interface DistanceSummaryProps {
  shortestInfo: ShortestInfo;
  referencePointOptions: { value: ReferencePointType; label: string }[];
  referencePoint: ReferencePointType;
  onReferencePointChange: (value: ReferencePointType) => void;
}

export function DistanceSummary({
  shortestInfo,
  referencePoint,
  referencePointOptions,
  onReferencePointChange,
}: DistanceSummaryProps) {
  const transportTypeText = TRANSPORTATION_TYPE[shortestInfo.transportType];
  const subjectParticle = getSubjectParticle(shortestInfo.name);
  const directionParticle = getDirectionParticle(transportTypeText);

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Dropdown options={referencePointOptions} value={referencePoint} onChange={onReferencePointChange} />
        <Summary highlight={shortestInfo.name} truncate>{`에서 ${shortestInfo.name}${subjectParticle}`}</Summary>
      </div>
      <Summary highlight={transportTypeText}>{`${transportTypeText}${directionParticle} 가장 가까워요`}</Summary>
    </>
  );
}

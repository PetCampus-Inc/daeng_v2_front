import { findShortestFromComparisons } from '../lib/findShortestFromComparisons';
import { DistanceComparisonsByRef, Summary, REFERENCE_POINT_TYPE, TRANSPORTATION_TYPE } from '@entities/compare';
import { getDirectionParticle, getSubjectParticle } from '@shared/utils/text';

export function DistanceSummary({ comparisons }: { comparisons: DistanceComparisonsByRef }) {
  const shortestInfo = findShortestFromComparisons(comparisons);

  if (!shortestInfo) {
    return (
      <>
        <Summary>거리 정보가</Summary>
        <Summary highlight='충분하지 않아요'>충분하지 않아요</Summary>
      </>
    );
  }

  const refPointText = REFERENCE_POINT_TYPE[shortestInfo.referencePoint];
  const transportTypeText = TRANSPORTATION_TYPE[shortestInfo.transportType];
  const subjectParticle = getSubjectParticle(shortestInfo.name);
  const directionParticle = getDirectionParticle(transportTypeText);

  return (
    <>
      <Summary
        highlight={shortestInfo.name}
        truncate
      >{`${refPointText}에서 ${shortestInfo.name}${subjectParticle}`}</Summary>
      <Summary highlight={transportTypeText}>{`${transportTypeText}${directionParticle} 가장 가까워요`}</Summary>
    </>
  );
}

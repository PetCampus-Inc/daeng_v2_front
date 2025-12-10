import { findShortestFromComparisons } from '../lib/findShortestFromComparisons';
import { DistanceComparisonsByRef, Summary, REFERENCE_POINT_TYPE, TRANSPORTATION_TYPE } from '@entities/compare';

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
  const typeText = TRANSPORTATION_TYPE[shortestInfo.transportType];

  return (
    <>
      <Summary highlight={shortestInfo.name} truncate>{`${refPointText}에서 ${shortestInfo.name}이`}</Summary>
      <Summary highlight={typeText}>{`${typeText}로 가장 가까워요`}</Summary>
    </>
  );
}

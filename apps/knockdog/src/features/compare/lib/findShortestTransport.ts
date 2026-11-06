import type { TransportationType, ShortestInfo, DistanceComparisonsByTransport } from '@entities/compare';

export function findShortestTransport(comparisonsByTransport: DistanceComparisonsByTransport): ShortestInfo {
  const defaultInfo: ShortestInfo = {
    ...comparisonsByTransport['WALKING'].leftKg,
    transportType: 'WALKING',
  };

  let shortestInfo: ShortestInfo | null = null;

  for (const [transportType, comparison] of Object.entries(comparisonsByTransport)) {
    const { variant, leftKg: closerKg } = comparison; // 왼쪽: 가까운 유치원

    if (variant === 'insufficient-data') continue; // leftKg.value === 0

    if (!shortestInfo || closerKg.value < shortestInfo.value) {
      shortestInfo = {
        name: closerKg.name,
        avatar: closerKg.avatar,
        value: closerKg.value,
        transportType: transportType as TransportationType,
      };
    }
  }

  // 모든 교통수단 데이터가 없을 때는 WALKING을 기본값으로 반환
  return shortestInfo ?? defaultInfo;
}

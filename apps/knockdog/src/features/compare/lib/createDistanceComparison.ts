import type { KindergartenComparison } from '@entities/compare';
import { DetailComparisonItem, DistanceDetailComparison } from '@entities/compare';

// 거리 비교 헬퍼 함수
export function createDistanceComparison(
  left: KindergartenComparison,
  right: KindergartenComparison,
  extractTime: (kg: KindergartenComparison) => number
): DistanceDetailComparison {
  const leftTime = extractTime(left);
  const rightTime = extractTime(right);

  // 거리 정보가 없는 경우
  if (leftTime === 0) {
    return {
      variant: 'insufficient-data' as const,
      leftKg: {
        name: left.name,
        avatar: left.thumbnailS3Key,
        value: leftTime,
      }, // 왼쪽: 데이터 없는 유치원
      rightKg: {
        name: right.name,
        avatar: right.thumbnailS3Key,
        value: rightTime,
      },
    };
  }
  if (rightTime === 0) {
    return {
      variant: 'insufficient-data' as const,
      leftKg: {
        name: right.name,
        avatar: right.thumbnailS3Key,
        value: rightTime,
      },
      rightKg: {
        name: left.name,
        avatar: left.thumbnailS3Key,
        value: leftTime,
      },
    };
  }

  // 두 거리가 같은 경우
  if (leftTime === rightTime) {
    return {
      variant: 'equal' as const,
      leftKg: {
        name: left.name,
        avatar: left.thumbnailS3Key,
        value: leftTime,
      }, // 순서 상관없으므로 유지
      rightKg: {
        name: right.name,
        avatar: right.thumbnailS3Key,
        value: rightTime,
      },
    };
  }

  // 거리가 다른 경우
  const [closerKg, fartherKg] = [
    { name: left.name, avatar: left.thumbnailS3Key, value: leftTime },
    { name: right.name, avatar: right.thumbnailS3Key, value: rightTime },
  ].sort((a, b) => a.value - b.value) as [DetailComparisonItem, DetailComparisonItem];

  return {
    variant: 'closer' as const,
    leftKg: closerKg, // 왼쪽: 가까운 유치원
    rightKg: fartherKg,
  };
}

import { parseTimeToMinutes } from '@entities/compare/lib/utils';
import {
  DistanceComparisonItem,
  DistanceDetailComparison,
  KindergartenComparison,
} from '@entities/compare/model/types';

// 거리 비교 헬퍼 함수
export function createDistanceComparison(
  left: KindergartenComparison,
  right: KindergartenComparison,
  extractTime: (kg: KindergartenComparison) => string
): DistanceDetailComparison {
  const leftTimeStr = extractTime(left);
  const rightTimeStr = extractTime(right);
  const leftMinutes = parseTimeToMinutes(leftTimeStr);
  const rightMinutes = parseTimeToMinutes(rightTimeStr);

  // 거리 정보가 없는 경우
  if (leftMinutes === Infinity || leftMinutes === 0) {
    return {
      variant: 'insufficient-data' as const,
      leftKg: {
        name: left.name,
        avatar: left.thumbnailS3Key,
        timeStr: leftTimeStr,
        minutes: leftMinutes,
      }, // 왼쪽: 데이터 없는 유치원
      rightKg: {
        name: right.name,
        avatar: right.thumbnailS3Key,
        timeStr: rightTimeStr,
        minutes: rightMinutes,
      },
    };
  }
  if (rightMinutes === Infinity || rightMinutes === 0) {
    return {
      variant: 'insufficient-data' as const,
      leftKg: {
        name: right.name,
        avatar: right.thumbnailS3Key,
        timeStr: rightTimeStr,
        minutes: rightMinutes,
      },
      rightKg: {
        name: left.name,
        avatar: left.thumbnailS3Key,
        timeStr: leftTimeStr,
        minutes: leftMinutes,
      },
    };
  }

  // 두 거리가 같은 경우
  if (leftMinutes === rightMinutes) {
    return {
      variant: 'equal' as const,
      leftKg: {
        name: left.name,
        avatar: left.thumbnailS3Key,
        timeStr: leftTimeStr,
        minutes: leftMinutes,
      }, // 순서 상관없으므로 유지
      rightKg: {
        name: right.name,
        avatar: right.thumbnailS3Key,
        timeStr: rightTimeStr,
        minutes: rightMinutes,
      },
    };
  }

  // 거리가 다른 경우
  const [closerKg, fartherKg] = [
    { name: left.name, avatar: left.thumbnailS3Key, timeStr: leftTimeStr, minutes: leftMinutes },
    { name: right.name, avatar: right.thumbnailS3Key, timeStr: rightTimeStr, minutes: rightMinutes },
  ].sort((a, b) => a.minutes - b.minutes) as [DistanceComparisonItem, DistanceComparisonItem];

  return {
    variant: 'closer' as const,
    leftKg: closerKg, // 왼쪽: 가까운 유치원
    rightKg: fartherKg,
  };
}

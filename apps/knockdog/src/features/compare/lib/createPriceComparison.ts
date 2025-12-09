import { DetailComparisonItem, KindergartenComparison, PriceDetailComparison } from '@entities/compare/model/types';

// 가격 비교 헬퍼 함수
export function createPriceComparison(
  left: KindergartenComparison,
  right: KindergartenComparison,
  extractPrice: (kg: KindergartenComparison) => number
): PriceDetailComparison {
  const leftPrice = extractPrice(left);
  const rightPrice = extractPrice(right);

  // 가격 정보가 없는 경우
  if (leftPrice === 0) {
    return {
      variant: 'insufficient-data' as const,
      leftKg: { name: left.name, avatar: left.thumbnailS3Key, value: leftPrice }, // 왼쪽: 데이터 없는 유치원
      rightKg: { name: right.name, avatar: right.thumbnailS3Key, value: rightPrice },
    };
  }
  if (rightPrice === 0) {
    return {
      variant: 'insufficient-data' as const,
      leftKg: { name: right.name, avatar: right.thumbnailS3Key, value: rightPrice },
      rightKg: { name: left.name, avatar: left.thumbnailS3Key, value: leftPrice },
    };
  }

  // 두 가격이 같은 경우
  if (leftPrice === rightPrice) {
    return {
      variant: 'equal' as const,
      leftKg: { name: left.name, avatar: left.thumbnailS3Key, value: leftPrice }, // 순서 상관없으므로 유지
      rightKg: { name: right.name, avatar: right.thumbnailS3Key, value: rightPrice },
    };
  }

  // 가격이 다른 경우
  const [cheaperKg, expensiveKg] = [
    { name: left.name, avatar: left.thumbnailS3Key, value: leftPrice },
    { name: right.name, avatar: right.thumbnailS3Key, value: rightPrice },
  ].sort((a, b) => a.value - b.value) as [DetailComparisonItem, DetailComparisonItem];

  return {
    variant: 'cheaper' as const,
    leftKg: cheaperKg, // 왼쪽: 저렴한 유치원
    rightKg: expensiveKg,
  };
}

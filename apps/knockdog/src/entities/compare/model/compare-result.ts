import type { ReferencePointType, TransportationType } from './compare';

/** 비교 결과 아이템 모델 */
interface SimpleComparisonItem {
  name: string;
  avatar: string;
}

interface DetailComparisonItem extends SimpleComparisonItem {
  value: number;
}

/** 가격 비교 */
interface PriceDetailComparison {
  variant: 'cheaper' | 'equal' | 'insufficient-data';
  leftKg: DetailComparisonItem;
  rightKg: DetailComparisonItem;
}

/** 거리 비교 */
type DistanceComparisonsByRef = Partial<Record<ReferencePointType, DistanceComparisonsByTransport>>;

type DistanceComparisonsByTransport = Partial<Record<TransportationType, DistanceDetailComparison>>;

interface DistanceDetailComparison {
  variant: 'closer' | 'equal' | 'insufficient-data';
  leftKg: DetailComparisonItem;
  rightKg: DetailComparisonItem;
}

export type {
  SimpleComparisonItem,
  DetailComparisonItem,
  PriceDetailComparison,
  DistanceComparisonsByRef,
  DistanceComparisonsByTransport,
  DistanceDetailComparison,
};

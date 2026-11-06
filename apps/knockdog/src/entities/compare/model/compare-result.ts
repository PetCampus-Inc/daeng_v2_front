import type { TransportationType } from './compare';

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
type DistanceComparisonsByTransport = Record<TransportationType, DistanceDetailComparison>;

interface DistanceDetailComparison {
  variant: 'closer' | 'equal' | 'insufficient-data';
  leftKg: DetailComparisonItem;
  rightKg: DetailComparisonItem;
}

interface ShortestInfo extends DetailComparisonItem {
  transportType: TransportationType;
}

/** 캐러셀/테이블 데이터 타입*/
interface CellData {
  value: string;
  detail?: string;
}

interface RowData {
  label: string;
  left: CellData;
  right: CellData;
}

interface SlideProps {
  type: string;
  rows: RowData[];
}

interface TableProps {
  title?: string;
  rows: RowData[];
}

export type {
  SimpleComparisonItem,
  DetailComparisonItem,
  PriceDetailComparison,
  DistanceComparisonsByTransport,
  DistanceDetailComparison,
  ShortestInfo,
  CellData,
  RowData,
  SlideProps,
  TableProps,
};

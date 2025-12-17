/** 상수 */
export {
  CTAG_MAP,
  PRODUCT_TYPE,
  TRANSPORTATION_TYPE,
  REFERENCE_POINT_TYPE,
  DAY_OF_WEEK_SHORT,
  CLOSED_DAYS,
} from './constants/compare';

/** 모델 */
export type {
  KindergartenComparison,
  CTag,
  Product,
  ProductType,
  ReferencePointType,
  TransportationType,
  DayOfWeekShort,
} from './compare';

export type {
  SimpleComparisonItem,
  DetailComparisonItem,
  PriceDetailComparison,
  DistanceComparisonsByTransport,
  DistanceDetailComparison,
  ShortestInfo,
} from './compare-result';

interface KindergartenShortInfo {
  id: string;
  name: string;
  thumbnailS3Key: string;
  categories: string[];
}
export type { KindergartenShortInfo };

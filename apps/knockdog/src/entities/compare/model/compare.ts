import {
  CTAG_MAP,
  PRODUCT_TYPE,
  TRANSPORTATION_TYPE,
  REFERENCE_POINT_TYPE,
  DAY_OF_WEEK_SHORT,
  CLOSED_DAYS,
} from './constants/compare';

interface KindergartenComparison {
  id: string;
  name: string;
  categories: CTag[];
  thumbnailS3Key: string;
  pricing: Pricing;
  service: string[]; // 프로젝트에선 FilterOption[], 여기선 string으로 충분
  distance: Distance[];
  operatingSchedule: OperatingSchedule;
}

/** 카테고리 */
type CTag = keyof typeof CTAG_MAP;

/** 이용요금 */
interface Pricing {
  monthlyHourlyAvg: number;
  countHourlyAvg: number;
  products: Product[];
}

interface Product {
  productType: ProductType;
  min: ProductInfo;
  max: ProductInfo;
  monthlyHourlyAvg: number;
  countTicketAvg: number;
}

type ProductType = keyof typeof PRODUCT_TYPE;

interface ProductInfo {
  name: string;
  price: number;
}

/** 거리 */
interface Distance {
  referencePoint: ReferencePointType;
  distance: string; // "9.6km"
  transitTimes: TransitTime[];
}

type ReferencePointType = keyof typeof REFERENCE_POINT_TYPE;

interface TransitTime {
  type: TransportationType;
  time: string; // TODO: api 수정 후 time: number 타입으로 수정
}

type TransportationType = keyof typeof TRANSPORTATION_TYPE;

/** 영업일 */
interface OperatingSchedule {
  closedDays: ClosedDay[];
  weekdayHours: string | null;
  weekendHours: string | null;
}

type ClosedDay = keyof typeof CLOSED_DAYS;

type DayOfWeekShort = keyof typeof DAY_OF_WEEK_SHORT;

export type {
  KindergartenComparison,
  CTag,
  Pricing,
  Product,
  ProductType,
  ProductInfo,
  Distance,
  ReferencePointType,
  TransitTime,
  TransportationType,
  OperatingSchedule,
  ClosedDay,
  DayOfWeekShort,
};

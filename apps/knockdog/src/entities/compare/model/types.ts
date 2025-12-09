// apps/knockdog/app/compare-complete/types.ts

// ===== 상수 =====
export const CTAG_MAP = {
  KINDERGARTEN: '유치원',
  HOTEL: '호텔',
  GROOMING: '미용',
  TRAINING: '훈련',
  PET_SHOP: '강아지 용품',
} as const;
export type CTag = keyof typeof CTAG_MAP;

export const PRODUCT_TYPE = {
  DAYCARE: '데이케어',
  NIGHT_CARE: '나이트케어',
  TRAINING: '훈련',
  MEMBERSHIP: '멤버십',
} as const;
export type ProductType = keyof typeof PRODUCT_TYPE;

export const TRANSPORTATION_TYPE = {
  WALKING: '도보',
  TRANSIT: '대중교통',
  DRIVING: '차량',
} as const;
export type TransportationType = keyof typeof TRANSPORTATION_TYPE;

export const REFERENCE_POINT_TYPE: Record<string, string> = {
  HOME: '집',
  WORK: '직장',
};
export type ReferencePointType = keyof typeof REFERENCE_POINT_TYPE | string;

export const DAY_OF_WEEK = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
} as const;
export type DayOfWeek = keyof typeof DAY_OF_WEEK;

// ===== 타입 =====
export interface ProductInfo {
  name: string;
  price: number;
}

export interface Product {
  productType: ProductType;
  min: ProductInfo;
  max: ProductInfo;
  monthlyHourlyAvg: number;
  countHourlyAvg: number;
}

export interface Pricing {
  monthlyHourlyAvg: number;
  countHourlyAvg: number;
  products: Product[];
}

export interface TransitTime {
  type: TransportationType;
  time: string; // "N분", "N시간", "N시간 N분"
}

export interface Distance {
  referencePoint: string; // "HOME" | "WORK" | ...
  distance: string; // "9.6km"
  transitTimes: TransitTime[];
}

type ClosedDay = DayOfWeek | 'HOLIDAY';
export interface OperatingSchedule {
  closedDays: ClosedDay[];
  weekdayHours: string | null;
  weekendHours: string | null;
}

export interface KindergartenComparison {
  id: string;
  name: string;
  categories: CTag[]; // 예: ["HOTEL","GROOMING"]
  thumbnailS3Key: string; // s3 key
  pricing: Pricing;
  service: string[]; // 프로젝트에선 FilterOption[], 여기선 string으로 충분
  distance: Distance[];
  operatingSchedule: OperatingSchedule;
}

// 가격 비교
export type PricingComparisonVariant = 'cheaper' | 'equal' | 'insufficient-data';
export interface PriceDetailComparison {
  variant: PricingComparisonVariant;
  leftKg: PricingComparisonItem;
  rightKg: PricingComparisonItem;
}
export interface PricingComparisonItem {
  name: string;
  avatar: string;
  value: number;
}

// 거리 비교
export type DistanceComparisonVariant = 'closer' | 'equal' | 'insufficient-data';
export interface DistanceDetailComparison {
  variant: DistanceComparisonVariant;
  leftKg: DistanceComparisonItem;
  rightKg: DistanceComparisonItem;
}
export interface DistanceComparisonItem {
  name: string;
  avatar: string;
  timeStr: string; // "2시간 49분", "21분"
  minutes: number; // 비교를 위한 분 단위 값
}

export type DistanceComparisonsByRef = Record<
  ReferencePointType,
  Partial<Record<TransportationType, DistanceDetailComparison>>
>;

export interface SimpleComparisonItem {
  name: string;
  avatar: string;
}

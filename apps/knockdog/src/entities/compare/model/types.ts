// apps/knockdog/app/compare-complete/types.ts

// ===== 상수 =====
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

export const DAY_OF_WEEK = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
  WEEKEND: '주말',
  HOLIDAY: '공휴일',
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
  passAvg: number; // 횟수권 평균가
  subscriptionHourlyAvg: number; // 정기권 평균가(시간당)
}

export interface Pricing {
  passHourlyAvg: number;
  subscriptionHourlyAvg: number;
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

export interface OperatingSchedule {
  closedDays: DayOfWeek[];
  weekdayHours: string | null;
  weekendHours: string | null;
}

export interface KindergartenComparison {
  id: string;
  name: string;
  categories: string[]; // 예: ["HOTEL","GROOMING"]
  thumbnailS3Key: string; // s3 key
  pricing: Pricing;
  service: string[]; // 프로젝트에선 FilterOption[], 여기선 string으로 충분
  distance: Distance[];
  operatingSchedule: OperatingSchedule;
}

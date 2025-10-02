import { PICKUP_TYPE_MAP, OPEN_STATUS_MAP, ALL_SERVICE_MAP, CTAG_MAP } from './constants/kindergarten';

export interface KindergartenSearchList {
  paging: {
    currentPage: number;
    hasNext: boolean;
    totalPage: number;
  };
  schoolResult: {
    totalCount: number;
    list: KindergartenListItem[];
  };
}

export interface Aggregation {
  aggregations: {
    sidoAggregations: SidoGunguAggregation[] | null;
    sigunAggregations: SidoGunguAggregation[] | null;
    geoBoundAggregation: GeoBoundAggregation;
  };
}

interface Kindergarten {
  id: string;
  title: string;
  ctg: keyof typeof CTAG_MAP;
  operationDescription: string;
  operationStatus: keyof typeof OPEN_STATUS_MAP;
  price: number;
  dist: number;
  roadAddress: string;
  reviewCount: number;
  serviceTags: (keyof typeof ALL_SERVICE_MAP)[];
  pickupType: keyof typeof PICKUP_TYPE_MAP;
  banner: string[];
  bookmarked: boolean;
  memoDate: string;
  phoneNumber: string;
}
export interface KindergartenListItem {
  id: string;
  title: string;
  ctg: string;
  images?: string[];
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  operationStatus: keyof typeof OperationStatus;
  price: number;
  dist: number;
  roadAddress: string;
  coord: Coord;
  reviewCount: number;
  serviceTags: (keyof typeof ServiceTag)[];
  pickupType: keyof typeof PickupType;
}
interface Coord {
  lat: number;
  lng: number;
}
export interface SidoGunguAggregation {
  code: string;
  count: number;
  label: string;
  coord: Coord;
  nextZoom: number;
}

interface GeoBoundAggregation {
  sw: Coord;
  ne: Coord;
}

export const ServiceTag = {
  DIARY: '1:1 알림장',
  DOG_SHOP: '강아지 용품샵',
  DOG_CAFE: '강아지 카페',
  PARKING: '주차장',
  VALET: '발렛파킹',

  DAYCARE: '데이케어',
  HOTEL: '호텔링',
  STAY_24H: '24시간 상주',
  TEMPERAMENT: '성격·성향 진단',
  SPLIT_CLASS: '분반 돌봄',
  BATH_SERVICE: '목욕',
  WALK: '산책',
  TRAINING: '훈련',
  GROOMING: '미용',
  REHABILITATION: '재활',

  NON_SLIP: '미끄럼방지 바닥',
  CCTV: 'CCTV',
  PLAYGROUND: '놀이터',
  ROOFTOP: '루프탑',
  TERRACE: '테라스',
  TRAINING_GROUND: '운동장',
  YARD: '마당',
} as const;

export const PickupType = {
  NONE: null,
  FREE: '무료 픽드랍',
  PAID: '유료 픽드랍',
} as const;

export const OperationStatus = {
  OPEN: '영업중',
  CLOSED: '영업종료',
  DAY_OFF: '휴무',
} as const;

export type { Kindergarten };

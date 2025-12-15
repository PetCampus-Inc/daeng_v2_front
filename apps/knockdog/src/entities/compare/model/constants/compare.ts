import { DAY_OF_WEEK } from '@shared/constants';

const CTAG_MAP = {
  KINDERGARTEN: '유치원',
  HOTEL: '호텔',
  GROOMING: '미용',
  TRAINING: '훈련',
  PET_SHOP: '강아지 용품',
  PLAYGROUND: '놀이터',
  CAFE: '카페',
  VETERINARY: '동물병원',
  FITNESS: '피트니스',
} as const;

const PRODUCT_TYPE = {
  DAYCARE: '데이케어',
  NIGHT_CARE: '나이트케어',
  TRAINING: '훈련',
  MEMBERSHIP: '멤버십',
} as const;

const TRANSPORTATION_TYPE = {
  WALKING: '도보',
  DRIVING: '자동차',
  TRANSIT: '대중교통',
} as const;

const REFERENCE_POINT_TYPE = {
  HOME: '집',
  WORK: '직장',
  OTHER: '기타',
} as const;

const DAY_OF_WEEK_SHORT = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
} as const;

const CLOSED_DAYS = {
  ...DAY_OF_WEEK,
  WEEKEND: '주말',
  HOLIDAY: '공휴일',
} as const;

export { CTAG_MAP, PRODUCT_TYPE, TRANSPORTATION_TYPE, REFERENCE_POINT_TYPE, DAY_OF_WEEK_SHORT, CLOSED_DAYS };

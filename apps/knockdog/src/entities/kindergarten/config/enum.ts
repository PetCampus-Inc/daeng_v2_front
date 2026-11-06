export const CTG = {
  HOTEL: '호텔',
  KINDERGARTEN: '유치원',
  GROOMING: '미용',
  PLAYGROUND: '놀이터',
  CAFE: '카페',
  PET_SHOP: '펫샵',
  TRAINING: '훈련',
  FITNESS: '피트니스',
  VETERINARY: '동물병원',
  DAYCARE: '데이케어',
  SPA: '스파',
};

const OPERATION_STATUS_TYPE = {
  OPEN_NOW: '영업중',
  OPEN_HOLIDAY: '공휴일 영업',
} as const;

const DOG_BREED_TYPE = {
  ALL_BREEDS: '견종무관',
  SMALL_DOG_ONLY: '소형견 전용',
  MEDIUM_LARGE_DOG_ONLY: '중대형견 전용',
  CAT: '고양이',
} as const;

const DOG_SERVICE_TYPE = {
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
  AQUAL_FITNESS: '수중 피트니스',
  MASSAGE: '마사지',
  BEHAVIOR_CORRECTION: '행동 교정',
  VET_LINKED: '병원 연계',
} as const;

const DOG_SAFETY_FACILITY_TYPE = {
  NON_SLIP: '미끄럼방지 바닥',
  CCTV: 'CCTV',
  PLAYGROUND: '놀이터',
  ROOFTOP_TERRACE: '루프탑·테라스',
  TRAINING_GROUND_YARD: '운동장·마당',
  SWIMMING_POOL: '수영장',
  PRIVATE_ROOM: '개별 룸',
} as const;

const VISITOR_AMENITY_TYPE = {
  PAID_PICKUP: '유료 픽드랍',
  FREE_PICKUP: '무료 픽드랍',
  PICKDROP: '픽드랍',
  DIARY: '1:1 알림장',
  DOG_SHOP: '강아지 용품',
  DOG_CAFE: '강아지 카페',
  PARKING: '주차장',
  VALET: '발렛파킹',
} as const;

const EXPERT_CERTIFICATION_TYPE = {
  TRAINER: '훈련사',
  PET_CARE_MANAGER: '반려동물관리사',
  VET: '수의사',
} as const;

const PRODUCT_TYPE = {
  COUNT_TICKET: '횟수권',
  MONTHLY_TICKET: '정기권',
  MEMBERSHIP: '멤버십',
} as const;

export const SERVICE_TAGS = {
  ...OPERATION_STATUS_TYPE,
  ...DOG_BREED_TYPE,
  ...DOG_SERVICE_TYPE,
  ...DOG_SAFETY_FACILITY_TYPE,
  ...VISITOR_AMENITY_TYPE,
  ...EXPERT_CERTIFICATION_TYPE,
  ...PRODUCT_TYPE,
} as const;

export const PICKUP = {
  NONE: null,
  FREE_PICKUP: '무료 픽드랍',
  PAID_PICKUP: '유료 픽드랍',
} as const;

export const OPERATION_STATUS = {
  OPEN: '영업중',
  CLOSED: '영업종료',
  DAY_OFF: '오늘 휴무',
} as const;

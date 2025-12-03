const DOG_BREED_MAP = {
  ALL_BREEDS: '견종무관',
  SMALL_DOGS_ONLY: '소형견 전용',
  MEDIUM_LARGE_DOGS_ONLY: '중대형견 전용',
} as const;

const DOG_SERVICE_MAP = {
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
} as const;

const DOG_SAFETY_FACILITY_MAP = {
  NON_SLIP: '미끄럼방지 바닥',
  CCTV: 'CCTV',
  PLAYGROUND: '놀이터',
  ROOFTOP: '루프탑·테라스',
  YARD: '운동장·마당',
  TRAINING_GROUND_YARD: '운동장',
} as const;

const VISITOR_AMENITY_MAP = {
  PICK_DROP: '픽드랍',
  DIARY: '1:1 알림장',
  DOG_SHOP: '강아지 용품샵',
  DOG_CAFE: '강아지 카페',
  PARKING: '주차장',
  VALET: '발렛파킹',
} as const;

const PICKUP_TYPE_MAP = {
  NONE: null,
  FREE: '무료 픽드랍',
  PAID: '유료 픽드랍',
} as const;

const ALL_SERVICE_MAP = {
  ...DOG_BREED_MAP,
  ...DOG_SERVICE_MAP,
  ...DOG_SAFETY_FACILITY_MAP,
  ...VISITOR_AMENITY_MAP,
};

const SERVICE_ICON_MAP = {
  ALL_BREEDS: 'Alldogs',
  SMALL_DOGS_ONLY: 'Smalldog',
  MEDIUM_LARGE_DOGS_ONLY: 'Largedog',

  DAYCARE: 'Daycare',
  HOTEL: 'Hotel',
  STAY_24H: 'Time24',
  TEMPERAMENT: 'Personalitycheck',
  SPLIT_CLASS: 'Babydelivery',
  BATH_SERVICE: 'Bath',
  WALK: 'Walk',
  TRAINING: 'Training',
  GROOMING: 'Salon',
  REHABILITATION: 'Rehabilitation',
  NON_SLIP: 'Floor',
  CCTV: 'Cctv',
  PLAYGROUND: 'Playground',
  ROOFTOP: 'Rooftop',
  YARD: 'Frontyard',
  TRAINING_GROUND_YARD: 'Frontyard',
  PICK_DROP: 'PickdropLine',
  DIARY: 'Noticebook',
  DOG_SHOP: 'Toyshop',
  DOG_CAFE: 'Cafe',
  PARKING: 'Parking',
  VALET: 'Valet',
} as const;

const OPEN_STATUS_MAP = {
  OPEN: '영업중',
  CLOSED: '영업종료',
  HOLIDAY: '오늘 휴무',
} as const;

const CTAG_MAP = {
  KINDERGARTEN: '유치원',
  HOTEL: '호텔',
  GROOMING: '미용',
  TRAINING: '훈련',
  PET_SHOP: '강아지 용품',
} as const;

export {
  SERVICE_ICON_MAP,
  DOG_BREED_MAP,
  PICKUP_TYPE_MAP,
  DOG_SERVICE_MAP,
  DOG_SAFETY_FACILITY_MAP,
  VISITOR_AMENITY_MAP,
  ALL_SERVICE_MAP,
  CTAG_MAP,
  OPEN_STATUS_MAP,
};

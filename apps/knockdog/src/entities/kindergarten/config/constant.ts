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
  HOLIDAY: '오늘 휴무',
} as const;

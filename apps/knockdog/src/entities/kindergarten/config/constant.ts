export const SERVICE_TAGS = {
  // 영업 시간
  OPEN_NOW: '영업중',
  OPEN_HOLIDAY: '공휴일 영업',

  // 견종 조건
  ALL_BREEDS: '견종 무관',
  SMALL_DOG_ONLY: '소형견 전용',
  MEDIUM_LARGE_DOG_ONLY: '중대형견 전용',
  CAT: '고양이',

  // 강아지 서비스
  DAYCARE: '데이케어',
  HOTEL: '호텔링',
  STAY_24H: '24시간 상주',
  SPLIT_CLASS: '분반 돌봄',
  TEMPERAMENT: '성격·성향 진단',
  BATH_SERVICE: '목욕',
  WALK: '산책',
  TRAINING: '훈련',
  GROOMING: '미용',
  REHABILITATION: '재활',
  PRIVATE_ROOM: '개별 룸',
  AQUAL_FITNESS: '아쿠아 피트니스',
  MASSAGE: '마사지',
  BEHAVIOR_CORRECTION: '행동 교정',
  SWIMMING_POOL: '수영장',

  // 강아지 안전 ∙ 시설
  NON_SLIP: '미끄럼방지 바닥',
  CCTV: 'CCTV',
  PLAYGROUND: '놀이터',
  ROOFTOP_TERRACE: '루프탑·테라스',
  TRAINING_GROUND_YARD: '운동장·마당',

  // 방문객 편의 ∙ 시설
  PICKDROP: '픽드랍',
  DIARY: '1:1 알림장',
  DOG_CAFE: '강아지 카페',
  DOG_SHOP: '강아지 용품',
  PARKING: '주차장',
  VALET: '발렛파킹',

  // 상품 유형
  COUNT_TICKET: '횟수권',
  MONTHLY_TICKET: '정기권',
  MEMBERSHIP: '멤버십',

  // 전문가
  TRAINER: '트레이너',
  PET_CARE_MANAGER: '펫케어 매니저',
  VET: '수의사',
  VET_LINKED: '병원 연계',
} as const;

export const PICKUP_TYPE = {
  NONE: null,
  FREE: '무료 픽드랍',
  PAID: '유료 픽드랍',
} as const;

export const OPERATION_STATUS = {
  OPEN: '영업중',
  CLOSED: '영업종료',
  HOLIDAY: '오늘 휴무',
} as const;

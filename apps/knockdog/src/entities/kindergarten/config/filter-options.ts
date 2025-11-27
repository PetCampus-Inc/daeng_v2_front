export const FILTER_OPTIONS = {
  // 영업 시간
  OPEN_NOW: '영업중',
  OPEN_HOLIDAY: '공휴일 영업',

  // 견종 조건
  ALL_BREEDS: '견종 무관',
  SMALL_DOG_ONLY: '소형견 전용',
  MEDIUM_LARGE_DOG_ONLY: '중대형견 전용',

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
} as const;

export const FILTER_CONFIG = {
  '영업 시간': ['OPEN_NOW', 'OPEN_HOLIDAY'],
  '견종 조건': ['ALL_BREEDS', 'SMALL_DOG_ONLY', 'MEDIUM_LARGE_DOG_ONLY'],
  '강아지 서비스': [
    'DAYCARE',
    'HOTEL',
    'STAY_24H',
    'SPLIT_CLASS',
    'TEMPERAMENT',
    'BATH_SERVICE',
    'WALK',
    'TRAINING',
    'GROOMING',
    'REHABILITATION',
  ],
  '강아지 안전 ∙ 시설': ['NON_SLIP', 'CCTV', 'PLAYGROUND', 'ROOFTOP_TERRACE', 'TRAINING_GROUND_YARD'],
  '방문객 편의 ∙ 시설': ['PICKDROP', 'DIARY', 'DOG_CAFE', 'DOG_SHOP', 'PARKING', 'VALET'],
  '상품 유형': ['COUNT_TICKET', 'MONTHLY_TICKET', 'MEMBERSHIP'],
} as const;

export const SHORT_CUT_FILTER_OPTIONS: FilterOption[] = [
  'STAY_24H',
  'CCTV',
  'DAYCARE',
  'HOTEL',
  'PICKDROP',
  'WALK',
  'TRAINING',
  'SPLIT_CLASS',
  'SMALL_DOG_ONLY',
  'MEDIUM_LARGE_DOG_ONLY',
];

export type FilterOption = keyof typeof FILTER_OPTIONS;
export type FilterCategory = keyof typeof FILTER_CONFIG;

export type FilterState = FilterOption[];

export const filterOptions = Object.values(FILTER_OPTIONS);

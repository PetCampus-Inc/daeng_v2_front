export const FILTER_CONFIG = {
  OPERATION: {
    label: '영업 시간',
    options: {
      OPEN: '영업중',
      HOLIDAY_OPEN: '공휴일 영업',
      DISTANCE: '거리순',
    },
  },
  BREED_CONDITION: {
    label: '견종 조건',
    options: {
      GENERAL: '견종 무관',
      SMALL_ONLY: '소형견 전용',
      LARGE_MEDIUM_ONLY: '중대형견 전용',
    },
  },
  DOG_SERVICES: {
    label: '강아지 서비스',
    options: {
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
    },
  },
  DOG_FACILITIES: {
    label: '강아지 안전 ∙ 시설',
    options: {
      NON_SLIP: '미끄럼방지 바닥',
      CCTV: 'CCTV',
      PLAYGROUND: '놀이터',
      ROOFTOP: '루프탑·테라스',
      YARD: '운동장·마당',
    },
  },
  VISITOR_FACILITIES: {
    label: '방문객 편의 ∙ 시설',
    options: {
      PICK_DROP: '픽드랍',
      DIARY: '1:1 알림장',
      DOG_CAFE: '강아지 카페',
      PARKING: '주차장',
      VALET: '발렛파킹',
    },
  },
  PRODUCT_TYPES: {
    label: '상품 유형',
    options: {
      PASS_TICKET: '횟수권',
      SUBSCRIPTION: '정기권',
      MEMBERSHIP: '멤버십',
    },
  },
} as const;

export type FilterCategory = keyof typeof FILTER_CONFIG;

export type FilterOptions = {
  [K in FilterCategory]: keyof (typeof FILTER_CONFIG)[K]['options'];
}[FilterCategory];

export type FilterState = Partial<Record<FilterCategory, FilterOptions[]>>;

export type SearchFilterKeys = {
  [K in FilterCategory]?: string[];
};

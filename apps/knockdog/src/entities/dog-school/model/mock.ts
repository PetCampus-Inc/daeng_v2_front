export interface DogSchoolResult {
  totalCount: number;
  list: DogSchool[];
}

export interface DogSchoolWithMetaResult {
  totalCount: number;
  list: DogSchoolWithMeta[];
}

export type 견종 = 'ALL_BREEDS' | 'SMALL_DOGS_ONLY' | 'MEDIUM_LARGE_DOGS_ONLY';
export type 강아지_서비스 =
  | 'DAYCARE'
  | 'HOTEL'
  | 'STAY_24H'
  | 'TEMPERAMENT'
  | 'SPLIT_CLASS'
  | 'BATH_SERVICE'
  | 'WALK'
  | 'TRAINING'
  | 'GROOMING'
  | 'REHABILITATION';

export type 강아지_안전_시설 = 'NON_SLIP' | 'CCTV' | 'PLAYGROUND' | 'ROOFTOP' | 'TERRACE' | 'TRAINING_GROUND' | 'YARD';

export type 방문객_편의_시설 = 'PICK_DROP' | 'DIARY' | 'DOG_SHOP' | 'DOG_CAFE' | 'PARKING' | 'VALET';

export const DogBreed = {
  ALL_BREEDS: '견종무관',
  SMALL_DOGS_ONLY: '소형견 전용',
  MEDIUM_LARGE_DOGS_ONLY: '중대형견 전용',
} as const;

export const ServiceTag = {
  PICK_DROP: '픽드랍',
  DIARY: '1:1 알림장',
  DOG_SHOP: '강아지 용품샵',
  DOG_CAFE: '강아지 카페',
  PARKING: '주차창',
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

export interface DogSchool {
  id: string;
  title: string;
  ctg: string;
  images: string[];
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  operationStatus: keyof typeof OperationStatus;
  price: number;
  dist: number;
  roadAddress: string;
  coord: {
    lat: number;
    lng: number;
  };
  reviewCount: number;
  serviceTags: (keyof typeof ServiceTag)[];
  pickupType: keyof typeof PickupType;
}

export type ProductType = 'COUNT' | 'PERIOD' | 'MEMBERSHIP';
export interface DogSchoolProduct {
  productTypes: ProductType[];
  priceImages: string[];
  lastUpdated: string;
}

export interface DogSchoolWithMeta extends DogSchool {
  memo?: DogSchoolMemo;
  isBookmarked?: boolean;
}

export interface DogSchoolMemo {
  id: string;
  shopId: string;
  content: string;
  updatedAt: string;
}

export interface DogSchoolBookmark {
  id: string;
  shopId: string;
}

export interface DogSchoolReview {
  id: string;
  userName: string;
  profileImage: string;
  title: string;
  content: string;
  createdAt: string;
}

export const memoMockData: DogSchoolMemo[] = [
  {
    id: '1',
    shopId: '12',
    content:
      '시설은 진짜 좋은데 너무 비싸서 고민되는데ㅠㅠ 선생님들과 원장님과 얘기해보니 믿고 맡길 수 있을 것 같아서 돈이 아깝지 않을듯..?',
    updatedAt: '2025-01-01',
  },
];

export const bookmarkMockData: DogSchoolBookmark[] = [
  {
    id: '1',
    shopId: '12',
  },
  {
    id: '2',
    shopId: '36',
  },
];

export const mockData: DogSchoolResult = {
  totalCount: 99,
  list: [
    {
      id: '12',
      title: '전설의강아지',
      ctg: '유치원, 카페',
      images: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
      ],
      operationTimes: {
        startTime: '08:30',
        endTime: '21:30',
      },
      operationStatus: 'CLOSED',
      price: 30000,
      dist: 4.3010179500859325,
      roadAddress: '서울특별시 강남구 선릉로115길 22',
      coord: {
        lat: 37.5119475,
        lng: 127.041237,
      },
      reviewCount: 165,
      serviceTags: ['DIARY', 'HOTEL', 'TRAINING', 'PARKING', 'DOG_CAFE', 'DOG_SHOP', 'PLAYGROUND', 'YARD'],
      pickupType: 'FREE',
    },
    {
      id: '24',
      title: '해피독 유치원',
      ctg: '유치원, 훈련소',
      images: [
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
      ],
      operationTimes: {
        startTime: '09:00',
        endTime: '19:00',
      },
      operationStatus: 'OPEN',
      price: 45000,
      dist: 2.1,
      roadAddress: '서울특별시 송파구 올림픽로 300',
      coord: {
        lat: 37.5070736,
        lng: 127.1255221,
      },
      reviewCount: 89,
      serviceTags: ['PARKING', 'DIARY', 'DOG_CAFE', 'DOG_SHOP', 'PLAYGROUND'],
      pickupType: 'FREE',
    },
    {
      id: '36',
      title: '멍멍이 놀이터',
      ctg: '카페, 놀이터',
      images: [
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=300&fit=crop',
      ],
      operationTimes: {
        startTime: '10:00',
        endTime: '22:00',
      },
      operationStatus: 'OPEN',
      price: 15000,
      dist: 1.8,
      roadAddress: '서울특별시 마포구 홍대로 153',
      coord: {
        lat: 37.5563,
        lng: 126.9236,
      },
      reviewCount: 234,
      serviceTags: ['DOG_CAFE', 'PLAYGROUND', 'YARD', 'DOG_SHOP', 'PARKING'],
      pickupType: 'NONE',
    },
    {
      id: '48',
      title: '반려동물 힐링센터',
      ctg: '유치원, 호텔, 미용',
      images: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=300&fit=crop',
      ],
      operationTimes: {
        startTime: '08:00',
        endTime: '20:00',
      },
      operationStatus: 'DAY_OFF',
      price: 60000,
      dist: 3.7,
      roadAddress: '서울특별시 서초구 강남대로 429',
      coord: {
        lat: 37.4979,
        lng: 127.0276,
      },
      reviewCount: 142,
      serviceTags: ['HOTEL', 'PARKING', 'DIARY', 'GROOMING'],
      pickupType: 'PAID',
    },
    {
      id: '60',
      title: '왈왈월드',
      ctg: '유치원, 카페, 놀이터',
      images: [
        'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=300&fit=crop',
      ],
      operationTimes: {
        startTime: '09:30',
        endTime: '21:00',
      },
      operationStatus: 'OPEN',
      price: 35000,
      dist: 5.2,
      roadAddress: '서울특별시 용산구 이태원로 200',
      coord: {
        lat: 37.5345,
        lng: 126.9949,
      },
      reviewCount: 318,
      serviceTags: ['DOG_CAFE', 'PLAYGROUND', 'YARD', 'DOG_SHOP', 'PARKING', 'DIARY'],
      pickupType: 'FREE',
    },
    {
      id: '72',
      title: '강아지별 훈련소',
      ctg: '훈련소, 유치원',
      images: [
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
      ],
      operationTimes: {
        startTime: '07:00',
        endTime: '18:00',
      },
      operationStatus: 'OPEN',
      price: 80000,
      dist: 6.8,
      roadAddress: '서울특별시 강서구 화곡로 302',
      coord: {
        lat: 37.5419,
        lng: 126.8397,
      },
      reviewCount: 76,
      serviceTags: ['TRAINING', 'PARKING', 'CCTV', 'DIARY', 'DOG_CAFE'],
      pickupType: 'PAID',
    },
  ],
};

// TODO: 실제 가공 처리 함수로 교체
export function combineShopWithMeta(
  shops: DogSchool[],
  memos: DogSchoolMemo[],
  bookmarks: DogSchoolBookmark[]
): DogSchoolWithMeta[] {
  return shops.map((shop) => {
    const memo = memos.find((item) => item.shopId === shop.id);
    const isBookmarked = bookmarks.some((item) => item.shopId === shop.id);

    return {
      ...shop,
      memo,
      isBookmarked,
    };
  });
}

export function getCombinedMockData(): DogSchoolWithMetaResult {
  return {
    totalCount: mockData.totalCount,
    list: combineShopWithMeta(mockData.list, memoMockData, bookmarkMockData),
  };
}

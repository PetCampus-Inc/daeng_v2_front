export interface DogSchool {
  providerId: string;
  providerName: string;
  images: string[];
  businessType: string[];
  userDistance: number;
  address: string;
  cord: {
    lat: number;
    lng: number;
  };
  reviewCount: number;
  operationStatus: 'OPEN' | 'CLOSE' | 'DAY_OFF';
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  price: number;
  bookmarked: boolean;
}

interface Memo {
  memoId: string;
  providerId: string;
  content: string;
  updatedAt: string;
}

interface Bookmark {
  providerId: string;
}

export const mockData: DogSchool[] = [
  {
    providerId: 'daycare-1',
    providerName: '강아지 유치원',
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
    ],
    businessType: ['유치원', '호텔', '미용'],
    userDistance: 0.6,
    address: '서울 강남구 논현로 123길 37',
    cord: {
      lat: 37.5112139,
      lng: 127.0599892,
    },
    reviewCount: 128,
    operationStatus: 'OPEN',
    operationTimes: {
      startTime: '09:00',
      endTime: '20:00',
    },
    price: 30000,
    bookmarked: false,
  },
  {
    providerId: 'daycare-2',
    providerName: '그린모래 강아지 유치원',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400&h=300&fit=crop',
    ],
    businessType: ['유치원'],
    userDistance: 5.2,
    address: '서울 서초구 강남대로 456번길 12',
    cord: {
      lat: 37.4852141,
      lng: 127.0380121,
    },
    reviewCount: 89,
    operationStatus: 'CLOSE',
    operationTimes: {
      startTime: '07:00',
      endTime: '23:00',
    },
    price: 25000,
    bookmarked: true,
  },
  {
    providerId: 'daycare-3',
    providerName: '해피독 반려동물 케어센터 & 유치원',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
    ],
    businessType: ['유치원', '호텔', '미용'],
    userDistance: 15.7,
    address: '서울 마포구 월드컵로 789',
    cord: {
      lat: 37.5112139,
      lng: 127.0599892,
    },
    reviewCount: 342,
    operationStatus: 'OPEN',
    operationTimes: {
      startTime: '09:00',
      endTime: '18:00',
    },
    price: 40000,
    bookmarked: false,
  },
  {
    providerId: 'daycare-4',
    providerName: '펫플러스 반려동물 케어센터',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    ],
    businessType: ['유치원', '호텔', '미용'],
    userDistance: 15.7,
    address: '서울 마포구 월드컵로 789',
    cord: {
      lat: 37.5112139,
      lng: 127.0599892,
    },
    reviewCount: 100,
    operationStatus: 'OPEN',
    operationTimes: {
      startTime: '09:00',
      endTime: '18:00',
    },
    price: 40000,
    bookmarked: false,
  },
];

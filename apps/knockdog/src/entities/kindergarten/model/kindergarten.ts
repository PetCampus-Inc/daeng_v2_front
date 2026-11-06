import { OPERATION_STATUS, PICKUP, SERVICE_TAGS } from '../config/enum';
export interface Kindergarten {
  id: string;
  /** 앱 리뷰 등 `/schools/{schoolId}` API 키. 미등록 유치원은 null */
  schoolId?: number | string | null;
  schoolStatus?: string;
  title: string;
  ctg: string;
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  businessStatus: {
    title: string;
    description: string;
  };
  operationStatus: keyof typeof OPERATION_STATUS;
  price: number;
  dist: number;
  coords: {
    lat: number;
    lng: number;
  };
  roadAddress: string;
  reviewCount: number;
  rating?: number;
  verified?: boolean;
  serviceTags: (keyof typeof SERVICE_TAGS)[];
  pickupType: keyof typeof PICKUP;
  banner: string[];
  bookmarked: boolean;
  memoDate: string;
  phoneNumber: string;
}

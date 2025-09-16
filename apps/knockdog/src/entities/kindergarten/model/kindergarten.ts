import { PICKUP_TYPE_MAP, OPEN_STATUS_MAP, ALL_SERVICE_MAP, CTAG_MAP } from './constants/kindergarten';

interface Kindergarten {
  id: string;
  title: string;
  ctg: keyof typeof CTAG_MAP;
  operationDescription: string;
  operationStatus: keyof typeof OPEN_STATUS_MAP;
  price: number;
  dist: number;
  roadAddress: string;
  reviewCount: number;
  serviceTags: (keyof typeof ALL_SERVICE_MAP)[];
  pickupType: keyof typeof PICKUP_TYPE_MAP;
  banner: string[];
  bookmarked: boolean;
  memoDate: string;
  phoneNumber: string;
}

export type { Kindergarten };

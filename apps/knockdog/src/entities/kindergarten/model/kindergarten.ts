import { OPEN_STATUS_MAP, CTAG_MAP } from './constants/kindergarten';
import { PICKUP_TYPE, SERVICE_TAGS } from '../config/constant';
export interface Kindergarten {
  id: string;
  title: string;
  ctg: keyof typeof CTAG_MAP;
  operationDescription: string;
  operationStatus: keyof typeof OPEN_STATUS_MAP;
  price: number;
  dist: number;
  coords: {
    lat: number;
    lng: number;
  };
  roadAddress: string;
  reviewCount: number;
  serviceTags: (keyof typeof SERVICE_TAGS)[];
  pickupType: keyof typeof PICKUP_TYPE;
  banner: string[];
  bookmarked: boolean;
  memoDate: string;
  phoneNumber: string;
}

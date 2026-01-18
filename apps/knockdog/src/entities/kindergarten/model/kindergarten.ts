import { CTAG_MAP } from './constants/kindergarten';
import { OPERATION_STATUS, PICKUP_TYPE, SERVICE_TAGS } from '../config/constant';
export interface Kindergarten {
  id: string;
  title: string;
  ctg: keyof typeof CTAG_MAP;
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  operationDescription: string;
  operationStatus: keyof typeof OPERATION_STATUS;
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

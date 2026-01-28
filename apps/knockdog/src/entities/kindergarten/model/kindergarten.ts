import { OPERATION_STATUS, PICKUP, SERVICE_TAGS } from '../config/enum';
export interface Kindergarten {
  id: string;
  title: string;
  ctg: string;
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
  pickupType: keyof typeof PICKUP;
  banner: string[];
  bookmarked: boolean;
  memoDate: string;
  phoneNumber: string;
}

import { SERVICE_TAGS, OPERATION_STATUS, PICKUP } from '../config/enum';

interface KindergartenNear {
  id: string;
  title: string;
  ctg: string;
  roadAddress: string;
  dist: number;
  operationStatus: keyof typeof OPERATION_STATUS;
  serviceTags: (keyof typeof SERVICE_TAGS)[];
  pickupType: keyof typeof PICKUP;
  price: number;
  reviewCount: number;
  memoDate: string;
  banner: string[];
  operationDescription: string;
  bookmarked: boolean;
}

export type { KindergartenNear };

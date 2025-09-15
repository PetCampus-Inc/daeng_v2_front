import type { OPEN_STATUS_MAP } from './constants/kindergarten';
import type { PICKUP_TYPE_MAP } from './constants/kindergarten';
import type { DogBreed, DogService, DogSafetyFacility, VisitorAmenity } from './service';

interface KindergartenNear {
  id: string;
  title: string;
  ctg: string;
  roadAddress: string;
  dist: number;
  operationStatus: keyof typeof OPEN_STATUS_MAP;
  serviceTags: (DogBreed | DogService | DogSafetyFacility | VisitorAmenity)[];
  pickupType: keyof typeof PICKUP_TYPE_MAP;
  price: number;
  reviewCount: number;
  memoDate: string;
  image: string;
  operationDescription: string;
  bookmarked: boolean;
}

export type { KindergartenNear };

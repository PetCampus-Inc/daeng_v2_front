import { PICKUP_TYPE_MAP, OPEN_STATUS_MAP, ALL_SERVICE_MAP, CTAG_MAP } from './constants/kindergarten';
import type { OperationStatus, ServiceTag, PickupType } from '../config/constant';

export interface KindergartenSearchList {
  paging: {
    currentPage: number;
    hasNext: boolean;
    totalPage: number;
  };
  schoolResult: {
    totalCount: number;
    list: KindergartenListItem[];
  };
}

export interface Aggregation {
  aggregations: {
    sidoAggregations: SidoGunguAggregation[] | null;
    sigunAggregations: SidoGunguAggregation[] | null;
    geoBoundAggregation: GeoBoundAggregation;
  };
}

export interface Kindergarten {
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
export interface KindergartenListItem {
  id: string;
  title: string;
  ctg: string;
  images?: string[];
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  operationStatus: keyof typeof OperationStatus;
  price: number;
  dist: number;
  roadAddress: string;
  coord: Coord;
  reviewCount: number;
  serviceTags: (keyof typeof ServiceTag)[];
  pickupType: keyof typeof PickupType;
  phoneNumber: string;
}
interface Coord {
  lat: number;
  lng: number;
}
export interface SidoGunguAggregation {
  code: string;
  count: number;
  label: string;
  coord: Coord;
  nextZoom: number;
}

interface GeoBoundAggregation {
  sw: Coord;
  ne: Coord;
}

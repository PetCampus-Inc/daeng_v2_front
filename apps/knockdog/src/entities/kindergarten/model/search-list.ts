import type { OperationStatus, ServiceTag, PickupType } from '../config/constant';

export interface KindergartenSearchList {
  paging: {
    currentPage: number;
    hasNext: boolean;
    totalPage: number;
  };
  schoolResult: {
    totalCount: number;
    exactCount: number | null;
    nearbyCount: number | null;
    exact: KindergartenListItem | null;
    list: KindergartenListItem[];
  };
}

export interface Aggregation {
  aggregations: {
    sidoAggregations: SidoGunguAggregation[] | null;
    sigunAggregations: SidoGunguAggregation[] | null;
    geoBoundAggregation: GeoBoundAggregation;
  };
  bounds: {
    swLng: number;
    swLat: number;
    neLng: number;
    neLat: number;
  };
}

export interface KindergartenListItem {
  id: string;
  title: string;
  ctg: string;
  banner?: string[];
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

export interface Coord {
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

export interface GeoBoundAggregation {
  sw: Coord;
  ne: Coord;
}

import type { OPERATION_STATUS, SERVICE_TAGS, PICKUP } from '../config/enum';
import type { Coord } from '@shared/types';

export interface KindergartenSearchListDto {
  paging: {
    currentPage: number;
    hasNext: boolean;
    totalPage: number;
  };
  schoolResult: {
    totalCount: number;
    exactCount: number;
    nearbyCount: number;
    exact: KindergartenListItemDto | null;
    list: KindergartenListItemDto[];
  };
}

export interface KindergartenListItemDto {
  id: string;
  title: string;
  ctg: string;
  banner?: string[];
  operationTimes: {
    startTime: string;
    endTime: string;
  };
  operationStatus: keyof typeof OPERATION_STATUS;
  businessStatus: {
    title: string;
    description: string;
  };
  price: number;
  dist: number;
  roadAddress: string;
  coords: Coord;
  reviewCount: number;
  serviceTags: (keyof typeof SERVICE_TAGS)[];
  pickupType: keyof typeof PICKUP;
  phoneNumber: string;
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

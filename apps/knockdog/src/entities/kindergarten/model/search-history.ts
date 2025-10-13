import type { FilterItemCode } from './autocomplete';

export interface RegionSearchKeyword {
  type: 'REGION';
  label: string;
  code: string;
  coord: { lat: number; lng: number };
  zoom: number;
}

export interface FilterItemSearchKeyword {
  type: 'FILTER_ITEM';
  label: string;
  code: FilterItemCode;
}

export interface UserQuerySearchKeyword {
  type: 'USER_QUERY';
  label: string;
}

export type RecentSearchKeyword = RegionSearchKeyword | FilterItemSearchKeyword | UserQuerySearchKeyword;

export interface RecentView {
  id: string;
  label: string;
  address: string;
}

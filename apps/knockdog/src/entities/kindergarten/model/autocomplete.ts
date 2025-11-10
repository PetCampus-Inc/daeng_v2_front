import { FilterOption } from '../config/filter-options';

export interface RegionSuggestion {
  type: 'REGION';
  code: string;
  label: string;
  coord: {
    lat: number;
    lng: number;
  };
  count: number;
  zoom: number;
}

// TODO: 다른 곳에서도 활용되는지 확인 필요
export type FilterItemCode = Exclude<
  FilterOption,
  'OPEN_NOW' | 'OPEN_HOLIDAY' | 'PASS_TICKET' | 'SUBSCRIPTION' | 'MEMBERSHIP'
>;

export interface FilterItemSuggestion {
  type: 'FILTER_ITEM';
  code: FilterItemCode;
  label: string;
  coord: null;
  count: number;
  zoom: number;
}

interface Place {
  id: string;
  title: string;
  coord: {
    lat: number;
    lng: number;
  };
  dist: number;
  ctg: string;
  roadAddress: string;
}

export interface Autocomplete {
  suggestion: RegionSuggestion[] | FilterItemSuggestion[];
  place: Place[];
}

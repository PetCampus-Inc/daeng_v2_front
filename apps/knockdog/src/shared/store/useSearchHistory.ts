import { create } from 'zustand';

import { TypedStorage } from '../lib';
import { STORAGE_KEYS, MAX_RECENT_ITEMS } from '../constants';

export interface RecentPlace {
  code: string;
  label: string;
  images: string;
}

export interface SearchKeywordBase<
  T extends 'REGION' | 'FILTER_ITEM' | 'USER_QUERY',
> {
  type: T;
  label: string;
  code?: string;
  coord?: { lat: number; lng: number } | null;
  count?: number;
  zoom?: number;
}

export type RegionSearchKeyword = SearchKeywordBase<'REGION'>;

export type FilterItemSearchKeyword = SearchKeywordBase<'FILTER_ITEM'>;

export type UserQuerySearchKeyword = SearchKeywordBase<'USER_QUERY'>;

type RecentSearchKeyword =
  | RegionSearchKeyword
  | FilterItemSearchKeyword
  | UserQuerySearchKeyword;

interface SearchHistoryStore {
  recentPlaces: RecentPlace[];
  recentSearchKeywords: RecentSearchKeyword[];

  addRecentPlace: (place: RecentPlace) => void;
  removeRecentPlace: (code: string) => void;
  clearRecentPlaces: () => void;

  addRecentSearchKeyword: (keyword: RecentSearchKeyword) => void;
  removeRecentSearchKeyword: (index: number) => void;
  clearRecentSearchKeywords: () => void;

  initialize: () => void;
}

const recentPlacesStorage = new TypedStorage<RecentPlace[]>(
  STORAGE_KEYS.RECENT_PLACE,
  { initialValue: [] }
);

const recentSearchKeywordsStorage = new TypedStorage<RecentSearchKeyword[]>(
  STORAGE_KEYS.RECENT_SEARCH_KEYWORD,
  { initialValue: [] }
);

/**
 * 최근 찾아본 장소 추가
 * @param items - 최근 찾아본 장소 목록
 * @param newItem - 추가할 장소 정보
 * @param maxItems - 최대 개수
 */
const addToHistory = <T extends { code: string }>(
  items: T[],
  newItem: T,
  maxItems: number
): T[] => {
  const filtered = items.filter((item) => item.code !== newItem.code);

  const updated = [newItem, ...filtered];

  // 최대 개수 제한
  return updated.slice(0, maxItems);
};

/**
 * 최근 검색어 추가
 * @param items - 최근 검색어 목록
 * @param newItem - 추가할 검색어 정보
 * @param maxItems - 최대 개수
 */
const addSearchKeywordToHistory = (
  items: RecentSearchKeyword[],
  newItem: RecentSearchKeyword,
  maxItems: number
): RecentSearchKeyword[] => {
  // 중복 검사
  const filtered = items.filter((item) => {
    if (item.type !== newItem.type) return true;
    if (item.label !== newItem.label) return true;
    if (
      (item.type === 'REGION' || item.type === 'FILTER_ITEM') &&
      (newItem.type === 'REGION' || newItem.type === 'FILTER_ITEM')
    ) {
      return item.code !== newItem.code;
    }

    return false;
  });

  const updated = [newItem, ...filtered];
  return updated.slice(0, maxItems);
};

export const useSearchHistory = create<SearchHistoryStore>((set, get) => ({
  recentPlaces: [],
  recentSearchKeywords: [],

  /**
   * 최근 찾아본 장소 추가
   * @param place - 추가할 장소 정보
   */
  addRecentPlace: (place) => {
    if (!place?.code || !place?.label) {
      console.warn('Invalid place data:', place);
      return;
    }

    const { recentPlaces } = get();
    const updatedPlaces = addToHistory(recentPlaces, place, MAX_RECENT_ITEMS);

    set({ recentPlaces: updatedPlaces });
    recentPlacesStorage.set(updatedPlaces);
  },

  /**
   * 최근 찾아본 장소 삭제
   * @param code - 삭제할 장소 코드
   */
  removeRecentPlace: (code) => {
    if (!code) {
      console.warn('Invalid place code for removal');
      return;
    }

    const { recentPlaces } = get();
    const updatedPlaces = recentPlaces.filter((place) => place.code !== code);

    set({ recentPlaces: updatedPlaces });
    recentPlacesStorage.set(updatedPlaces);
  },

  /**
   * 최근 찾아본 장소 초기화
   */
  clearRecentPlaces: () => {
    set({ recentPlaces: [] });
    recentPlacesStorage.clear();
  },

  /**
   * 최근 검색어 추가
   * @param keyword - 추가할 검색어 정보
   */
  addRecentSearchKeyword: (keyword) => {
    if (!keyword?.type || !keyword?.label) {
      console.warn('Invalid keyword data:', keyword);
      return;
    }

    const { recentSearchKeywords } = get();
    const updatedKeywords = addSearchKeywordToHistory(
      recentSearchKeywords,
      keyword,
      MAX_RECENT_ITEMS
    );

    set({ recentSearchKeywords: updatedKeywords });
    recentSearchKeywordsStorage.set(updatedKeywords);
  },

  /**
   * 최근 검색어 삭제
   * @param index - 삭제할 검색어 인덱스
   */
  removeRecentSearchKeyword: (index) => {
    if (typeof index !== 'number' || index < 0) {
      console.warn('Invalid index for keyword removal:', index);
      return;
    }

    const { recentSearchKeywords } = get();

    if (index >= recentSearchKeywords.length) {
      console.warn('Index out of bounds for keyword removal:', index);
      return;
    }

    const updatedKeywords = recentSearchKeywords.filter((_, i) => i !== index);

    set({ recentSearchKeywords: updatedKeywords });
    recentSearchKeywordsStorage.set(updatedKeywords);
  },

  /**
   * 최근 검색어 초기화
   */
  clearRecentSearchKeywords: () => {
    set({ recentSearchKeywords: [] });
    recentSearchKeywordsStorage.clear();
  },

  /**
   * 최근 검색어 및 찾아본 장소 가져오기(초기화)
   */
  initialize: () => {
    const places = recentPlacesStorage.get() ?? [];
    const keywords = recentSearchKeywordsStorage.get() ?? [];

    set({
      recentPlaces: places,
      recentSearchKeywords: keywords,
    });
  },
}));

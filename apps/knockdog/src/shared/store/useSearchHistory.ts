import { useState, useEffect, useCallback } from 'react';
import { MAX_RECENT_ITEMS, STORAGE_KEYS } from '../constants';
import type { RecentView, RecentSearchKeyword } from '@entities/kindergarten';
import { TypedStorage } from '@shared/lib';

const recentViewStorage = new TypedStorage<RecentView[]>(STORAGE_KEYS.RECENTLY_VIEWED_PLACE);
const recentKeywordStorage = new TypedStorage<RecentSearchKeyword[]>(STORAGE_KEYS.RECENTLY_SEARCHED_KEYWORD);

/**
 * 찾아본 뷰 추가
 * @param items - 최근 찾아본 뷰 목록
 * @param newItem - 추가할 장소 정보
 * @param maxItems - 최대 개수
 */
const addViewToHistory = <T extends { id: string }>(items: T[], newItem: T, maxItems: number): T[] => {
  const filtered = items.filter((item) => item.id !== newItem.id);

  const updated = [newItem, ...filtered];

  return updated.slice(0, maxItems);
};

/**
 * 검색어 추가
 * @param items - 최근 검색어 목록
 * @param newItem - 추가할 검색어 정보
 * @param maxItems - 최대 개수
 */
const addSearchKeywordToHistory = (
  items: RecentSearchKeyword[],
  newItem: RecentSearchKeyword,
  maxItems: number
): RecentSearchKeyword[] => {
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

export function useSearchHistory() {
  const [views, setViews] = useState<RecentView[]>([]);
  const [keywords, setKeywords] = useState<RecentSearchKeyword[]>([]);

  useEffect(() => {
    setViews(recentViewStorage.get() ?? []);
    setKeywords(recentKeywordStorage.get() ?? []);
  }, []);

  /**
   * 최근 찾아본 뷰 추가
   */
  const addView = useCallback(
    (view: RecentView) => {
      if (!view?.id || !view?.label) {
        console.warn('Invalid view data:', view);
        return;
      }

      const updated = addViewToHistory(views, view, MAX_RECENT_ITEMS);
      setViews(updated);
      recentViewStorage.set(updated);
    },
    [views]
  );

  /**
   * 최근 찾아본 뷰 삭제
   */
  const removeView = useCallback(
    (id: string) => {
      if (!id) {
        console.warn('Invalid place id for removal');
        return;
      }

      const updated = views.filter((place) => place.id !== id);
      setViews(updated);
      recentViewStorage.set(updated);
    },
    [views]
  );

  /**
   * 최근 찾아본 뷰 초기화
   */
  const clearViews = useCallback(() => {
    setViews([]);
    recentViewStorage.clear();
  }, []);

  /**
   * 검색어 추가
   * @param keyword {RecentSearchKeyword}
   */
  const addKeyword = useCallback(
    (keyword: RecentSearchKeyword) => {
      if (!keyword?.type || !keyword?.label) {
        console.warn('Invalid keyword data:', keyword);
        return;
      }

      const updated = addSearchKeywordToHistory(keywords, keyword, MAX_RECENT_ITEMS);
      setKeywords(updated);
      recentKeywordStorage.set(updated);
    },
    [keywords]
  );

  /**
   * 검색어 삭제
   * @param index {number}
   */
  const removeKeyword = useCallback(
    (index: number) => {
      if (typeof index !== 'number' || index < 0 || index >= keywords.length) {
        console.warn('Invalid index for keyword removal:', index);
        return;
      }

      const updated = keywords.filter((_, i) => i !== index);
      setKeywords(updated);
      recentKeywordStorage.set(updated);
    },
    [keywords]
  );

  /**
   * 검색어 초기화
   */
  const clearKeywords = useCallback(() => {
    setKeywords([]);
    recentKeywordStorage.clear();
  }, []);

  return {
    recentView: views,
    recentSearchKeywords: keywords,
    addRecentView: addView,
    removeRecentView: removeView,
    clearRecentViews: clearViews,
    addRecentSearchKeyword: addKeyword,
    removeRecentSearchKeyword: removeKeyword,
    clearRecentSearchKeywords: clearKeywords,
  };
}

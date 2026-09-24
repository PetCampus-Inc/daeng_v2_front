'use client';

import { useState, useEffect, useCallback } from 'react';

import { STORAGE_KEYS, MAX_KINDERGARTEN_NEWS_RECENT_SEARCH } from '@shared/constants/storage';
import { TypedStorage } from '@shared/lib';

const recentKeywordStorage = new TypedStorage<string[]>(STORAGE_KEYS.KINDERGARTEN_NEWS_RECENT_SEARCH);

function addKeywordToHistory(items: string[], keyword: string, maxItems: number) {
  const normalized = keyword.trim();
  if (!normalized) return items;

  const filtered = items.filter((item) => item !== normalized);
  return [normalized, ...filtered].slice(0, maxItems);
}

/**
 * 유치원 소식 최근 검색어 (기기 단위 localStorage)
 * - 보호자/원장 공유, 최대 10개, 최신순
 * - 계정·기기 변경 시 미유지
 */
function useKindergartenNewsSearchHistory() {
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    setKeywords(recentKeywordStorage.get() ?? []);
  }, []);

  const addKeyword = useCallback((keyword: string) => {
    const normalized = keyword.trim();
    if (!normalized) return;

    setKeywords((prev) => {
      const updated = addKeywordToHistory(prev, normalized, MAX_KINDERGARTEN_NEWS_RECENT_SEARCH);
      recentKeywordStorage.set(updated);
      return updated;
    });
  }, []);

  const removeKeyword = useCallback((index: number) => {
    setKeywords((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = prev.filter((_, i) => i !== index);
      recentKeywordStorage.set(updated);
      return updated;
    });
  }, []);

  const clearKeywords = useCallback(() => {
    setKeywords([]);
    recentKeywordStorage.clear();
  }, []);

  return {
    recentKeywords: keywords,
    hasRecentKeywords: keywords.length > 0,
    addRecentKeyword: addKeyword,
    removeRecentKeyword: removeKeyword,
    clearRecentKeywords: clearKeywords,
  };
}

export { useKindergartenNewsSearchHistory };

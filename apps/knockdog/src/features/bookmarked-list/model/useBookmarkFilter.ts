import { useState, useMemo } from 'react';
import { findDistanceByRefPoint, parseDistanceToKm } from '../lib/distance';
import { BookmarkItem } from '@entities/bookmark';
import type { ReferencePointType } from '@entities/compare';

/**
 * 북마크 목록을 필터링하고 정렬하는 커스텀 훅
 *
 * @param bookmarks - 필터링할 북마크 목록
 * @param searchQuery - 검색어 (유치원 이름 또는 주소로 필터링)
 * @returns 필터링된 북마크와 필터 상태 관리 함수들
 */
export function useBookmarkFilter({
  bookmarks,
  searchQuery = '',
}: {
  bookmarks: BookmarkItem[];
  searchQuery?: string;
}) {
  const [refPoint, setRefPoint] = useState<ReferencePointType>('HOME');
  const [showMemoOnly, setShowMemoOnly] = useState(false);

  const toggleShowMemoOnly = () => {
    setShowMemoOnly((prev) => !prev);
  };

  // refPoint로부터 가까운 거리 순 정렬
  const sortedBookmarks = useMemo(() => {
    return [...bookmarks].sort((a, b) => {
      const distA = findDistanceByRefPoint(a.distances, refPoint);
      const distB = findDistanceByRefPoint(b.distances, refPoint);
      const kmA = distA ? parseDistanceToKm(distA.distance) : Infinity;
      const kmB = distB ? parseDistanceToKm(distB.distance) : Infinity;
      return kmA - kmB;
    });
  }, [bookmarks, refPoint]);

  const filteredBookmarks = useMemo(() => {
    let filtered = sortedBookmarks;

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (kindergarten) =>
          kindergarten.name.toLowerCase().includes(query) || kindergarten.location?.toLowerCase().includes(query)
      );
    }

    // 메모만 보기 필터링
    if (showMemoOnly) {
      filtered = filtered.filter((kindergarten) => !!kindergarten.memoAt);
    }

    return filtered;
  }, [sortedBookmarks, showMemoOnly, searchQuery]);

  return {
    filteredBookmarks,
    refPoint,
    setRefPoint,
    showMemoOnly,
    toggleShowMemoOnly,
  };
}

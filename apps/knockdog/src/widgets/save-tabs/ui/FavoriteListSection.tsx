'use client';

import { useMemo, useState } from 'react';
import { EmptySection } from './EmptySection';
import { EmptyResultSection } from './EmptyResultSection';
import type { BookmarkItem, DistanceInfo } from '@entities/bookmark/';
import { BookmarkedListItem, FilterBar } from '@features/bookmarked-list';
import type { ReferencePointType } from '@entities/compare';
import { useStackNavigation } from '@shared/lib/bridge';
import { FloatingActionButton } from '@knockdog/ui';
import { useTabNavigation } from '@shared/lib/bridge';

// Helper: refPoint에 맞는 거리 정보 찾기
function findDistanceByRefPoint(distances: DistanceInfo[], refPoint: ReferencePointType): DistanceInfo | undefined {
  return distances.find((d) => d.referencePoint === refPoint);
}

// Helper: 거리를 숫자(km)로 파싱
function parseDistanceToKm(distance: string): number {
  const match = distance.match(/[\d.]+/);
  if (!match) {
    return Infinity;
  }
  return Number.parseFloat(match[0]);
}

function FavoriteListSection({ bookmarks, searchQuery = '' }: { bookmarks: BookmarkItem[]; searchQuery?: string }) {
  const [refPoint, setRefPoint] = useState<ReferencePointType>('HOME');
  const [showMemoOnly, setShowMemoOnly] = useState(false);
  const { push } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();

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

  const toggleShowMemoOnly = () => {
    setShowMemoOnly((prev) => !prev);
  };

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className='px-4'>
        <EmptySection />
      </div>
    );
  }

  // 검색어가 있고 필터링 결과가 없을 때
  if (searchQuery.trim() && filteredBookmarks.length === 0) {
    return (
      <div className='flex h-full min-h-0 flex-col'>
        <FilterBar
          refPoint={refPoint}
          onChangeRefPoint={setRefPoint}
          showMemoOnly={showMemoOnly}
          onMemoToggle={toggleShowMemoOnly}
        />
        <div className='flex flex-1 px-4'>
          <EmptyResultSection searchQuery={searchQuery} />
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <FilterBar
        refPoint={refPoint}
        onChangeRefPoint={setRefPoint}
        showMemoOnly={showMemoOnly}
        onMemoToggle={toggleShowMemoOnly}
      />
      <div className='min-h-0 flex-1 overflow-y-auto px-4'>
        <div>
          {filteredBookmarks.map((bookmark) => {
            const distInfo = findDistanceByRefPoint(bookmark.distances, refPoint);
            const distanceText = distInfo?.distance || '- km';
            return (
              <div className='py-5' key={bookmark.id}>
                <BookmarkedListItem
                  onClick={() => {
                    push({ pathname: `/kindergarten/${bookmark.id}` });
                  }}
                  kindergarten={bookmark}
                  distanceText={distanceText}
                />
              </div>
            );
          })}
        </div>
      </div>
      {filteredBookmarks.length > 0 && (
        <div className='fixed right-6 bottom-6 z-50'>
          <FloatingActionButton
            icon='CompareNav'
            label='비교하기'
            variant='neutralSolid'
            size='medium'
            extended={true}
            onClick={() => {
              navigateToTab('/compare');
            }}
          />
        </div>
      )}
    </div>
  );
}

export { FavoriteListSection };

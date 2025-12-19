import { useState, useMemo } from 'react';
import { CompareListItem, FilterBar } from '@features/bookmarked-list';
import type { BookmarkItem, DistanceInfo } from '@entities/bookmark';
import type { ReferencePointType } from '@entities/compare';

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

interface FavoriteListSectionProps {
  bookmarks: BookmarkItem[];
  selectedIds: (string | null)[];
  searchQuery?: string;
  onListItemClick: (id: string) => void;
  onToggleCheckbox: (id: string) => void;
}

function FavoriteListSection({
  bookmarks,
  selectedIds,
  searchQuery = '',
  onListItemClick,
  onToggleCheckbox,
}: FavoriteListSectionProps) {
  const [refPoint, setRefPoint] = useState<ReferencePointType>('HOME');
  const [showMemoOnly, setShowMemoOnly] = useState(false);

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

  if (bookmarks.length === 0) {
    return <div className='flex h-full min-h-0 flex-col' />;
  }

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <FilterBar
        refPoint={refPoint}
        onChangeRefPoint={setRefPoint}
        showMemoOnly={showMemoOnly}
        onMemoToggle={toggleShowMemoOnly}
      />

      <div className='flex-1 overflow-y-auto'>
        {filteredBookmarks.map((kindergarten) => {
          const distInfo = findDistanceByRefPoint(kindergarten.distances, refPoint);
          const distanceText = distInfo?.distance || '- km';
          return (
            <CompareListItem
              key={kindergarten.id}
              kindergarten={kindergarten}
              distanceText={distanceText}
              isSelected={selectedIds.includes(kindergarten.id)}
              onToggle={() => onToggleCheckbox(kindergarten.id)}
              onClick={() => onListItemClick(kindergarten.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
export { FavoriteListSection };

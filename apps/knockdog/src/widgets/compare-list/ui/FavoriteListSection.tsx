import { EmptyResultSection, EmptySection } from '@widgets/save-tabs';
import { CompareListItem, findDistanceByRefPoint } from '@features/bookmarked-list';
import type { BookmarkItem } from '@entities/bookmark/';
import { ReferencePointType } from '@entities/compare';

interface FavoriteListSectionProps {
  bookmarks: BookmarkItem[];
  refPoint: ReferencePointType;
  searchQuery?: string;
  onListItemClick: (id: string) => void;
  selectedIds: (string | null)[];
  onToggleCheckbox: (id: string) => void;
}

function FavoriteListSection({
  bookmarks,
  refPoint,
  searchQuery,
  onListItemClick,
  selectedIds,
  onToggleCheckbox,
}: FavoriteListSectionProps) {
  // 검색어가 있고 필터링 결과가 없을 때
  if (searchQuery?.trim() && bookmarks.length === 0) {
    return (
      <div className='flex flex-1 px-4'>
        <EmptyResultSection searchQuery={searchQuery} />
      </div>
    );
  }

  // 북마크 목록이 비어있을 때
  if (bookmarks.length === 0) {
    return (
      <div className='flex flex-1 px-4'>
        <EmptySection />
      </div>
    );
  }

  return (
    <div className='min-h-0 flex-1 overflow-y-auto px-4'>
      <div>
        {bookmarks.map((kindergarten) => {
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

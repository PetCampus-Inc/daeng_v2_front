'use client';

import { EmptySection } from './EmptySection';
import { EmptyResultSection } from './EmptyResultSection';
import { BookmarkedListItem, findDistanceByRefPoint } from '@features/bookmarked-list';
import type { BookmarkItem } from '@entities/bookmark';
import type { ReferencePointType } from '@entities/compare';

interface FavoriteListSectionProps {
  bookmarks: BookmarkItem[];
  refPoint: ReferencePointType;
  searchQuery?: string;
  onListItemClick: (id: string) => void;
}

function FavoriteListSection({ bookmarks, refPoint, searchQuery, onListItemClick }: FavoriteListSectionProps) {
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
            <div className='py-5' key={kindergarten.id}>
              <BookmarkedListItem
                onClick={() => onListItemClick(kindergarten.id)}
                kindergarten={kindergarten}
                distanceText={distanceText}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { FavoriteListSection };

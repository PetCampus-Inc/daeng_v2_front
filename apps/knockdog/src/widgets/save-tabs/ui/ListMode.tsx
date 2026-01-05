import { FavoriteListSection } from './FavoriteListSection';
import { FloatingActionButton } from '@knockdog/ui';
import type { FilterState } from '@features/bookmarked-list';
import { FilterBar } from '@features/bookmarked-list';
import type { BookmarkItem } from '@entities/bookmark';
import { useStackNavigation } from '@shared/lib/bridge';
import { LoadingSpinner } from '@shared/ui/loading-spinner';

interface ListModeProps {
  bookmarks: BookmarkItem[];
  filterState: FilterState;
  searchQuery?: string;
  isLoading: boolean;
  onCompareClick: () => void;
}

export function ListMode({ bookmarks, filterState, searchQuery, isLoading, onCompareClick }: ListModeProps) {
  const { refPoint, onChangeRefPoint, showMemoOnly, onMemoToggle } = filterState;
  const { push } = useStackNavigation();

  // 유치원 상세 페이지로 이동
  const handleListItemClick = (id: string) => {
    push({ pathname: `/kindergarten/${id}` });
  };

  return (
    <div className='flex h-full flex-col bg-white'>
      <FilterBar
        refPoint={refPoint}
        onChangeRefPoint={onChangeRefPoint}
        showMemoOnly={showMemoOnly}
        onMemoToggle={onMemoToggle}
      />

      {isLoading ? (
        <LoadingSpinner fullscreen />
      ) : (
        <>
          <FavoriteListSection
            bookmarks={bookmarks}
            refPoint={refPoint}
            searchQuery={searchQuery}
            onListItemClick={handleListItemClick}
          />

          {/* 비교하기 플로팅 버튼 */}
          {bookmarks.length > 0 && (
            <div className='fixed right-6 bottom-6 z-50'>
              <FloatingActionButton
                icon='CompareNav'
                label='비교하기'
                variant='neutralSolid'
                size='medium'
                extended
                onClick={onCompareClick}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

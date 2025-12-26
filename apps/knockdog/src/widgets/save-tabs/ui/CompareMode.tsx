'use client';

import { useEffect, useMemo } from 'react';
import { FavoriteListSection, SelectionBar } from '@widgets/compare-list';
import { FilterBar } from '@features/bookmarked-list';
import type { FilterState } from '@features/bookmarked-list';
import { isSelectedIds } from '@entities/compare';
import type { BookmarkItem } from '@entities/bookmark';
import { useCompareStore } from '@shared/store';
import { useStackNavigation } from '@shared/lib/bridge';
import { webViewSyncChannel } from '@shared/lib/sync-webview-query';

interface CompareModeProps {
  bookmarks: BookmarkItem[];
  filterState: FilterState;
  searchQuery?: string;
  onCloseClick: () => void;
}

export function CompareMode({ bookmarks, onCloseClick, filterState, searchQuery }: CompareModeProps) {
  const { refPoint, onChangeRefPoint, showMemoOnly, onMemoToggle } = filterState;
  const { push } = useStackNavigation();

  // 선택된 유치원 상태
  const selectedIds = useCompareStore((state) => state.selectedIds);
  const toggle = useCompareStore((state) => state.toggle);

  const selectedKindergartens = useMemo(() => {
    const leftKg = bookmarks?.find((kg) => kg.id === selectedIds.left);
    const rightKg = bookmarks?.find((kg) => kg.id === selectedIds.right);
    return { left: leftKg, right: rightKg };
  }, [bookmarks, selectedIds]);

  // BroadcastChannel을 통한 WebView 간 동기화
  useEffect(() => {
    if (!webViewSyncChannel) return;

    const handleMessage = ({ data }: MessageEvent) => {
      if (data.type === 'SYNC_COMPARE_STORE' && isSelectedIds(data.payload)) {
        useCompareStore.setState({ selectedIds: data.payload });
      }
    };

    webViewSyncChannel.addEventListener('message', handleMessage);

    return () => {
      webViewSyncChannel?.removeEventListener('message', handleMessage);
    };
  }, []);

  // 비교 모드용 유치원 상세 페이지로 이동
  const handleListItemClick = (id: string) => {
    push({
      pathname: `/compare/kindergarten/${id}`,
      params: { selectedIds },
    });
  };

  return (
    <div className='flex h-full flex-col bg-white'>
      <FilterBar
        refPoint={refPoint}
        onChangeRefPoint={onChangeRefPoint}
        showMemoOnly={showMemoOnly}
        onMemoToggle={onMemoToggle}
      />
      <FavoriteListSection
        bookmarks={bookmarks}
        refPoint={refPoint}
        searchQuery={searchQuery}
        onListItemClick={handleListItemClick}
        selectedIds={[selectedIds.left, selectedIds.right]}
        onToggleCheckbox={toggle}
      />

      {/* 선택된 유치원 상태 바 */}
      <SelectionBar
        selectedKindergartens={selectedKindergartens}
        toggleSelection={toggle}
        onCloseClick={onCloseClick}
      />
    </div>
  );
}

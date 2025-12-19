'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@widgets/Header';
import { FavoriteListSection, SelectionBar } from '@widgets/compare-list';
import { bookmarkQueries } from '@entities/bookmark/api/bookmarkQueries';
import { isSelectedIds } from '@entities/compare';
import { useUserStore } from '@entities/user';
import { SafeArea } from '@shared/ui/safe-area';
import { useCompareStore } from '@shared/store';
import { useStackNavigation } from '@shared/lib/bridge';
import { webViewSyncChannel } from '@shared/lib/sync-webview-query';
import { useDebounced } from '@shared/lib';
import { tokenUtils } from '@shared/utils';

export function CompareMainPage() {
  // ============================================
  // 검색 관련 상태
  // ============================================
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const debouncedSearchQuery = useDebounced(localQuery, 300);

  const handleSearch = () => {
    setIsSearchMode(true);
  };

  const handleCloseSearch = () => {
    setIsSearchMode(false);
    setLocalQuery('');
  };

  // ============================================
  // 북마크 목록 관련 상태
  // ============================================
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const bookmarksQuery = useQuery({
    ...bookmarkQueries.list(isLoggedIn),
    enabled: isLoggedIn,
  });
  const bookmarks = bookmarksQuery.data ?? [];

  const { push } = useStackNavigation();

  // ============================================
  // 선택된 유치원 관련 상태
  // ============================================

  const selectedIds = useCompareStore((state) => state.selectedIds);
  const toggle = useCompareStore((state) => state.toggle);
  const reset = useCompareStore((state) => state.reset);

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
        const selectedIds = data.payload;
        useCompareStore.setState({ selectedIds });
      }
    };

    webViewSyncChannel.addEventListener('message', handleMessage);

    return () => {
      webViewSyncChannel?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleListItemClick = (id: string) => {
    push({
      pathname: `/compare/kindergarten/${id}`,
      params: { selectedIds },
    });
  };

  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      <div className='flex h-screen flex-col bg-white'>
        {isSearchMode ? (
          <Header>
            <Header.SearchField value={localQuery} onChange={setLocalQuery} />

            <Header.RightSection>
              <Header.CloseButton onClick={handleCloseSearch} />
            </Header.RightSection>
          </Header>
        ) : (
          <Header>
            <Header.LeftSection>
              <Header.BackButton />
            </Header.LeftSection>
            <Header.Title>보관함</Header.Title>

            <Header.RightSection>
              <IconButton icon='Search' onClick={handleSearch} />
            </Header.RightSection>
          </Header>
        )}

        <FavoriteListSection
          bookmarks={bookmarks}
          selectedIds={[selectedIds.left, selectedIds.right]}
          searchQuery={debouncedSearchQuery}
          onListItemClick={handleListItemClick}
          onToggleCheckbox={toggle}
        />

        <SelectionBar selectedKindergartens={selectedKindergartens} resetSelection={reset} toggleSelection={toggle} />
      </div>
    </SafeArea>
  );
}

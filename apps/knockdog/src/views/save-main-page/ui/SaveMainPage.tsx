'use client';

import { useState, useCallback, useEffect } from 'react';
import { IconButton } from '@knockdog/ui';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@widgets/Header';
import { SaveTabs } from '@widgets/save-tabs';
import { useBookmarkFilter } from '@features/bookmarked-list';
import { bookmarkQueries } from '@entities/bookmark/api/bookmarkQueries';
import { SafeArea } from '@shared/ui/safe-area';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';
import { useTabNavigation } from '@shared/lib/bridge';
import { useDebounced } from '@shared/lib';

export function SaveMainPage() {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [localQuery, setLocalQuery] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { navigateToTab } = useTabNavigation();

  const debouncedSearchQuery = useDebounced(localQuery, 300);

  const handleAuthError = useCallback(
    async (error: Error) => {
      await navigateToTab('/');
    },
    [navigateToTab]
  );

  const hasAuth = useRequireAuth(handleAuthError);

  useEffect(() => {
    setIsMounted(true);
    setIsLoggedIn(hasAuth);
  }, [hasAuth]);

  const { data: bookmarks = [], isLoading } = useQuery({
    ...bookmarkQueries.list(hasAuth),
    enabled: hasAuth,
  });

  const { filteredBookmarks, refPoint, setRefPoint, showMemoOnly, toggleShowMemoOnly } = useBookmarkFilter({
    bookmarks,
    searchQuery: debouncedSearchQuery,
  });

  const handleSearch = () => {
    setIsSearchMode(true);
  };

  const handleCloseSearch = () => {
    setIsSearchMode(false);
    setLocalQuery('');
  };

  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      {isSearchMode ? (
        <Header>
          <Header.SearchField value={localQuery} onChange={setLocalQuery} />

          <Header.RightSection>
            <Header.CloseButton onClick={handleCloseSearch} />
          </Header.RightSection>
        </Header>
      ) : (
        <Header>
          {isMounted && isLoggedIn && (
            <Header.RightSection>
              <IconButton icon='Search' onClick={handleSearch} />
            </Header.RightSection>
          )}

          <Header.Title>보관함</Header.Title>
        </Header>
      )}

      <div className='min-h-0 flex-1'>
        {isMounted && isLoggedIn && (
          <SaveTabs
            bookmarks={filteredBookmarks}
            isLoading={isLoading}
            searchQuery={debouncedSearchQuery}
            filterState={{ refPoint, showMemoOnly, onChangeRefPoint: setRefPoint, onMemoToggle: toggleShowMemoOnly }}
          />
        )}
      </div>
    </SafeArea>
  );
}

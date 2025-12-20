'use client';

import { useState, useCallback, useEffect } from 'react';
import { IconButton } from '@knockdog/ui';
import { SafeArea } from '@shared/ui/safe-area';
import { Header } from '@widgets/Header';
import { SaveTabs } from '@widgets/save-tabs';
import { useRequireAuth } from '@shared/ui/private-access/model/useRequireAuth';
import { useTabNavigation } from '@shared/lib/bridge';

export function SaveMainPage() {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { navigateToTab } = useTabNavigation();

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
          <Header.Title>보관함</Header.Title>

          {isMounted && isLoggedIn && (
            <Header.RightSection>
              <IconButton icon='Search' onClick={handleSearch} />
            </Header.RightSection>
          )}
        </Header>
      )}

      <div className='min-h-0 flex-1'>
        <SaveTabs searchQuery={localQuery} />
      </div>
    </SafeArea>
  );
}

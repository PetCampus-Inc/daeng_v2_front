'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useState } from 'react';

import { FavoriteListSection } from './FavoriteListSection';

import { useUserStore } from '@entities/user';

import { useQuery } from '@tanstack/react-query';
import { bookmarkQueries } from '@entities/bookmark/api/bookmarkQueries';
import { tokenUtils } from '@shared/utils';
import { useDebounced } from '@shared/lib';
import { HistoryTab } from './HistoryTab';

interface SaveTabsProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  searchQuery?: string;
}

function SaveTabs(
  { activeTab: controlledActiveTab, onTabChange, searchQuery = '' }: SaveTabsProps = {} as SaveTabsProps
) {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const [internalActiveTab, setInternalActiveTab] = useState('KINDERGARTEN');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = onTabChange ?? setInternalActiveTab;

  // 검색어 debounce 처리 (300ms 지연)
  const debouncedSearchQuery = useDebounced(searchQuery, 300);

  const bookmarksQuery = useQuery({
    ...bookmarkQueries.list(isLoggedIn),
    enabled: isLoggedIn,
  });

  const bookmarkCount = bookmarksQuery.data?.length ?? 0;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='flex h-full flex-col'>
      <TabsList scrollable className='sticky top-0 z-999 bg-white'>
        <TabsTrigger value='KINDERGARTEN'>관심 유치원 ({bookmarkCount})</TabsTrigger>
        <TabsTrigger value='HISTORY'>비교 기록</TabsTrigger>
      </TabsList>
      <TabsContent value='KINDERGARTEN' className='flex min-h-0 flex-1 flex-col'>
        {/* 관심 유치원 리스트 탭 */}
        <FavoriteListSection bookmarks={bookmarksQuery.data ?? []} searchQuery={debouncedSearchQuery} />
        {bookmarksQuery.isLoading && (
          <div className='px-4'>
            <div className='flex min-h-screen items-center justify-center'></div>
          </div>
        )}
      </TabsContent>
      <TabsContent value='HISTORY' className='flex min-h-0 flex-1 flex-col'>
        <HistoryTab searchQuery={debouncedSearchQuery} />
      </TabsContent>
    </Tabs>
  );
}

export { SaveTabs };

'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useState } from 'react';

import { FavoriteListSection } from './FavoriteListSection';

import { useUserStore } from '@entities/user';

import { useQuery } from '@tanstack/react-query';
import { bookmarkQueries } from '@entities/bookmark/api/bookmarkQueries';
import { tokenUtils } from '@shared/utils';
import { HistoryTab } from './HistoryTab';

function SaveTabs() {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user || tokenUtils.hasAccessToken();

  const [activeTab, setActiveTab] = useState('KINDERGARTEN');
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
        <FavoriteListSection bookmarks={bookmarksQuery.data ?? []} />
        {bookmarksQuery.isLoading && (
          <div className='px-4'>
            <div className='flex min-h-screen items-center justify-center'></div>
          </div>
        )}
      </TabsContent>
      <TabsContent value='HISTORY' className='flex min-h-0 flex-1 flex-col'>
        <HistoryTab />
      </TabsContent>
    </Tabs>
  );
}

export { SaveTabs };

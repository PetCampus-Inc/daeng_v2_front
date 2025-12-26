'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useState } from 'react';

import { HistoryTab } from './HistoryTab';
import { CompareMode } from './CompareMode';
import { ListMode } from './ListMode';
import type { FilterState } from '@features/bookmarked-list';
import type { BookmarkItem } from '@entities/bookmark';
import { useCompareStore } from '@shared/store';

interface SaveTabsProps {
  bookmarks: BookmarkItem[];
  isLoading: boolean;
  searchQuery?: string;
  filterState: FilterState;
}

function SaveTabs({ bookmarks, isLoading, searchQuery = '', filterState }: SaveTabsProps = {} as SaveTabsProps) {
  const reset = useCompareStore((state) => state.reset);

  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState('KINDERGARTEN');

  const handleEnterCompareMode = () => {
    reset();
    setIsCompareMode(true);
  };

  const handleExitCompareMode = () => {
    reset();
    setIsCompareMode(false);
  };

  const bookmarkCount = bookmarks.length ?? 0;

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div />
      </div>
    );
  }

  if (isCompareMode) {
    return (
      <CompareMode
        bookmarks={bookmarks}
        filterState={filterState}
        searchQuery={searchQuery}
        onCloseClick={handleExitCompareMode}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='flex h-full flex-col'>
      <TabsList scrollable className='sticky top-0 z-999 bg-white'>
        <TabsTrigger value='KINDERGARTEN'>관심 유치원 ({bookmarkCount})</TabsTrigger>
        <TabsTrigger value='HISTORY'>비교 기록</TabsTrigger>
      </TabsList>
      {/* 관심 유치원 리스트 탭 */}
      <TabsContent value='KINDERGARTEN' className='flex min-h-0 flex-1 flex-col'>
        <ListMode
          bookmarks={bookmarks}
          filterState={filterState}
          searchQuery={searchQuery}
          onCompareClick={handleEnterCompareMode}
        />
      </TabsContent>
      {/* 비교 기록 탭 */}
      <TabsContent value='HISTORY' className='flex min-h-0 flex-1 flex-col'>
        <HistoryTab searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  );
}

export { SaveTabs };

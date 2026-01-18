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
  onBookmarksRefetch: () => Promise<void>;
}

function SaveTabs({ bookmarks, isLoading, searchQuery = '', filterState, onBookmarksRefetch }: SaveTabsProps) {
  const reset = useCompareStore((state) => state.reset);

  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState('KINDERGARTEN');

  const handleEnterCompareMode = async () => {
    try {
      await onBookmarksRefetch(); // 비교 모드 진입 시 북마크 목록 갱신
      reset();
      setIsCompareMode(true);
    } catch {
      // 에러 발생 시 비교 모드 진입 취소
    }
  };

  const handleExitCompareMode = () => {
    reset();
    setIsCompareMode(false);
  };

  const bookmarkCount = bookmarks.length ?? 0;

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
      <TabsList scrollable className='sticky top-0 z-101 bg-white'>
        <TabsTrigger value='KINDERGARTEN'>관심 유치원 ({bookmarkCount})</TabsTrigger>
        <TabsTrigger value='HISTORY'>비교 기록</TabsTrigger>
      </TabsList>
      {/* 관심 유치원 리스트 탭 */}
      <TabsContent value='KINDERGARTEN' className='flex min-h-0 flex-1 flex-col'>
        <ListMode
          bookmarks={bookmarks}
          filterState={filterState}
          searchQuery={searchQuery}
          isLoading={isLoading}
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

'use client';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@knockdog/ui';
import { useState } from 'react';
import { overlay } from 'overlay-kit';

import { HistoryTab } from './HistoryTab';
import { CompareMode } from './CompareMode';
import { ListMode } from './ListMode';
import type { FilterState } from '@features/bookmarked-list';
import type { BookmarkItem } from '@entities/bookmark';
import { useCompareStore } from '@shared/store';
import { useUserStore, useAddUserAddressMutation, USER_ADDRESS_TYPE, type UserAddress } from '@entities/user';
import { openConfirmDialog, useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';
import { toast } from '@shared/ui/toast';

interface SaveTabsProps {
  bookmarks: BookmarkItem[];
  isLoading: boolean;
  searchQuery?: string;
  filterState: FilterState;
  onBookmarksRefetch: () => Promise<void>;
}

function SaveTabs({ bookmarks, isLoading, searchQuery = '', filterState, onBookmarksRefetch }: SaveTabsProps) {
  const reset = useCompareStore((state) => state.reset);
  const user = useUserStore((state) => state.user);
  const { pushForResult } = useStackNavigation();
  const addAddressMutation = useAddUserAddressMutation();

  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState('KINDERGARTEN');

  const proceedToCompareMode = async () => {
    try {
      await onBookmarksRefetch(); // 비교 모드 진입 시 북마크 목록 갱신
      reset();
      setIsCompareMode(true);
    } catch {
      // 에러 발생 시 비교 모드 진입 취소
    }
  };

  const registerHomeAddressAndCompare = async () => {
    let result: Omit<UserAddress, 'id'> | undefined;
    try {
      result = await pushForResult<Omit<UserAddress, 'id'>>(
        { pathname: route.register.location.add.root, query: { type: USER_ADDRESS_TYPE.HOME } },
        600_000
      );
    } catch {
      // 등록 화면에서 저장하지 않고 뒤로 나간 경우. 에러가 아니므로 조용히 무시한다.
      return;
    }
    if (!result) return;

    try {
      await addAddressMutation.mutateAsync({ ...result, id: '0', type: USER_ADDRESS_TYPE.HOME });
      await proceedToCompareMode();
    } catch (error) {
      console.error('장소 등록 실패:', error);
      toast({
        title: '일시적 오류로 요청을 완료하지 못했어요',
        nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
      });
    }
  };

  const openWebNoHomeAddressDialog = () =>
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>등록된 장소가 없어요</AlertDialogTitle>
            <AlertDialogDescription>
              장소를 등록하면 <br /> 유치원과의 거리를 비교할 수 있어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={close}>나중에 하기</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                close();
                await registerHomeAddressAndCompare();
              }}
            >
              등록하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));

  const handleOpenNoHomeAddressDialog = async () => {
    const result = await openConfirmDialog({
      title: '등록된 장소가 없어요',
      description: '장소를 등록하면\n유치원과의 거리를 비교할 수 있어요.',
      cancelLabel: '나중에 하기',
      confirmLabel: '등록하기',
    });

    if (result.status === 'pending') return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') void registerHomeAddressAndCompare();
      return;
    }

    openWebNoHomeAddressDialog();
  };

  const handleEnterCompareMode = async () => {
    const hasHomeAddress = user?.addresses?.some((addr) => addr.type === USER_ADDRESS_TYPE.HOME);
    if (!hasHomeAddress) {
      void handleOpenNoHomeAddressDialog();
      return;
    }

    await proceedToCompareMode();
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

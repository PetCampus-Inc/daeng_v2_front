'use client';

import { useMemo, useState } from 'react';
import { IconButton } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { FavoriteListSection, SelectionBar } from '@widgets/compare-list';
import { useBookmarksQuery } from '@features/bookmarked-list';
import { SafeArea } from '@shared/ui/safe-area';

export function CompareMainPage() {
  const { data: bookmarks = [] } = useBookmarksQuery();

  const [selectedIds, setSelectedIds] = useState<{
    left: string | null;
    right: string | null;
  }>({ left: null, right: null });

  const selectedKindergartens = useMemo(() => {
    const left = bookmarks?.find((kg) => kg.id === selectedIds.left);
    const right = bookmarks?.find((kg) => kg.id === selectedIds.right);
    return { left, right };
  }, [bookmarks, selectedIds]);

  const toggleCheckbox = (id: string) => {
    setSelectedIds((prev) => {
      // 1. 이미 선택된 유치원일 경우: 해당 슬롯을 비움
      if (prev.left === id) {
        return { ...prev, left: null };
      }
      if (prev.right === id) {
        return { ...prev, right: null };
      }

      // 2. 새로 선택된 유치원일 경우
      // 2-1. 이미 2개를 선택했다면 추가 불가
      if (prev.left !== null && prev.right !== null) {
        return { ...prev };
      }

      // 2-2. 빈 슬롯에 추가
      if (prev.left === null) {
        return { ...prev, left: id };
      }
      return { ...prev, right: id };
    });
  };

  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      <div className='flex h-screen flex-col bg-white'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>보관함</Header.Title>
          <Header.RightSection>
            <IconButton icon='Search' />
          </Header.RightSection>
        </Header>

        <FavoriteListSection
          bookmarks={bookmarks}
          selectedIds={[selectedIds.left, selectedIds.right]}
          toggleCheckbox={toggleCheckbox}
        />

        <SelectionBar
          selectedKindergartens={selectedKindergartens}
          resetSelection={() => setSelectedIds({ left: null, right: null })}
        />
      </div>
    </SafeArea>
  );
}

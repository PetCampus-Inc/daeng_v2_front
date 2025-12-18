'use client';

import { useState, useRef } from 'react';
import { Icon, IconButton, TextField, TextFieldInput } from '@knockdog/ui';
import { SafeArea } from '@shared/ui/safe-area';
import { Header } from '@widgets/Header';
import { SaveTabs } from '@widgets/save-tabs';

export function SaveMainPage() {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    setIsSearchMode(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleCloseSearch = () => {
    setIsSearchMode(false);
    setLocalQuery('');
  };

  const handleSubmit = () => {
    if (localQuery.trim()) {
      handleCloseSearch();
    }
  };

  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      {isSearchMode ? (
        <Header>
          <div className='relative mr-4 min-w-0 flex-1'>
            <TextField
              prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
              className='bg-fill-secondary-50 h-x12 min-w-0 border-0'
            >
              <TextFieldInput
                ref={searchInputRef}
                type='search'
                placeholder='업체 또는 주소를 검색하세요'
                aria-label='검색어 입력'
                autoFocus
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    handleSubmit();
                  }
                }}
              />
              {localQuery && (
                <button
                  type='button'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setLocalQuery('');
                  }}
                  aria-label='검색 결과 초기화'
                  className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
                >
                  <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
                </button>
              )}
            </TextField>
          </div>

          <Header.RightSection>
            <Header.CloseButton onClick={handleCloseSearch} />
          </Header.RightSection>
        </Header>
      ) : (
        <Header>
          <Header.Title>보관함</Header.Title>

          <Header.RightSection>
            <IconButton icon='Search' onClick={handleSearch} />
          </Header.RightSection>
        </Header>
      )}

      <div className='min-h-0 flex-1'>
        <SaveTabs searchQuery={localQuery} />
      </div>
    </SafeArea>
  );
}

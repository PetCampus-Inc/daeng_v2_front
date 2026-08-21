'use client';

import { ActionButton, TextField, TextFieldInput, Icon, IconButton } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import type { Breed } from '../model/breed.type';
import { useState } from 'react';
import { useBreedSearch } from '@features/dog-profile/model/useBreedSearch';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { TextHighlights } from '@shared/ui/text-highlights';

interface BreedSelectorProps {
  ref?: React.Ref<HTMLInputElement>;
  className?: string;
  value?: Breed | null;
  required?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
  onChange?: (breed: Breed | null) => void;
  onComplete?: () => void;
}

const BreedSelector = ({ ref, className, value, required, errorMessage, onChange, onBlur, onComplete }: BreedSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { breeds, searchTerm, setSearchTerm, isLoading } = useBreedSearch();

  const handleChange = (breed: Breed | null) => {
    onChange?.(breed);
    onComplete?.();

    setIsOpen(false);
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={setIsOpen}>
      <BottomSheet.Overlay className='z-overlay' />

      <BottomSheet.Trigger asChild>
        <TextField
          variant='secondary'
          label='견종'
          required={required}
          invalid={Boolean(errorMessage)}
          errorMessage={errorMessage}
          readOnly
          onBlur={onBlur}
          className={className}
          prefix={<Icon icon='Search' />}
          suffix={
            value && (
              <IconButton
                icon='DeleteInput'
                iconClassName='text-fill-secondary-700'
                onClick={(e) => {
                  e.stopPropagation();
                  handleChange?.(null);
                }}
              />
            )
          }
          indicator={required ? undefined : '(선택)'}
        >
          <TextFieldInput
            ref={ref}
            placeholder='견종을 검색해 보세요'
            value={value?.breedName ?? ''}
            onFocus={() => setIsOpen(true)}
          />
        </TextField>
      </BottomSheet.Trigger>

      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />

        {/* 시트 헤더 */}
        <BottomSheet.Header className='border-b border-line-200'>
          <BottomSheet.Title>견종 선택</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        {/* 견종 목록 */}
        <BreedSelectList
          className='px-4'
          query={searchTerm}
          breeds={breeds}
          value={value}
          isLoading={isLoading}
          onSearch={setSearchTerm}
          onSelect={handleChange}
        />
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

interface BreedSelectListProps {
  className?: string;
  query?: string;
  breeds?: Breed[];
  value?: Breed | null;
  isLoading?: boolean;
  onSearch?: (value: string) => void;
  onSelect?: (breed: Breed) => void;
}

const OTHER_BREED: Breed = { breedId: 0, breedName: '기타' };

function BreedSelectList({ className, query, breeds = [], value, isLoading, onSearch, onSelect }: BreedSelectListProps) {
  const hasNoResults = Boolean(query?.trim()) && !isLoading && breeds.length === 0;

  return (
    <div className={className}>
      <div className='py-4'>
        <TextField
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch?.(e.target.value)}
          variant='secondary'
          prefix={<Icon icon='Search' />}
          suffix={
            query && (
              <IconButton
                icon='DeleteInput'
                iconClassName='text-fill-secondary-700'
                onClick={() => onSearch?.('')}
              />
            )
          }
        >
          <TextFieldInput placeholder='견종을 검색해 보세요' />
        </TextField>
      </div>

      {hasNoResults ? (
        <div className='flex h-[calc(100dvh-250px)] flex-col items-center justify-center gap-4'>
          <div className='flex flex-col items-center gap-1'>
            <p className='h2-extrabold text-text-primary text-center'>일치하는 견종이 없어요</p>
            <p className='body1-regular text-text-secondary text-center'>검색어를 확인하거나 ‘기타’로 등록해 주세요.</p>
          </div>
          <ActionButton size='large' variant='secondaryLine' onClick={() => onSelect?.(OTHER_BREED)}>
            기타로 등록하기
          </ActionButton>
        </div>
      ) : (
        <ul className='scrollbar-hide flex h-[calc(100dvh-250px)] flex-col overflow-y-auto'>
          {breeds.map((breed, index) => (
            <button
              key={breed.breedId}
              type='button'
              className={cn(
                'gap-x2 border-line-200 active:bg-fill-secondary-50 flex items-center py-4',
                index !== breeds.length - 1 && 'border-b'
              )}
              onClick={() => onSelect?.(breed)}
            >
              <li
                className={cn(
                  'body1-medium text-text-primary text-start',
                  breed.breedId === value?.breedId && 'text-text-accent'
                )}
              >
                {TextHighlights(breed.breedName, query ?? '')}
              </li>
            </button>
          ))}
        </ul>
      )}
    </div>
  );
}

export { BreedSelector };

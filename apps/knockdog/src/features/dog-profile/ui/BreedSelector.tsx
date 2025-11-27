'use client';

import { TextField, TextFieldInput, Icon, IconButton } from '@knockdog/ui';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import type { Breed } from '../model/breed.type';
import { useBreedSearch } from '@features/dog-profile/model/useBreedSearch';
import { TextHighlights } from '@shared/ui/text-highlights';
import { useState } from 'react';

interface BreedSelectorProps {
  ref?: React.Ref<HTMLInputElement>;
  className?: string;
  value?: Breed | null;
  onBlur?: () => void;
  onChange?: (breed: Breed | null) => void;
  onComplete?: () => void;
}

const BreedSelector = ({ ref, className, value, onChange, onBlur, onComplete }: BreedSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { breeds, searchTerm, setSearchTerm } = useBreedSearch();

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
          readOnly
          onBlur={onBlur}
          className={className}
          prefix={<Icon icon='Search' />}
          suffix={
            value && (
              <IconButton
                icon='DeleteInput'
                onClick={(e) => {
                  e.stopPropagation();
                  handleChange?.(null);
                }}
              />
            )
          }
          indicator='(선택)'
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
        <BottomSheet.Header className=''>
          <BottomSheet.Title>견종 선택</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        {/* 견종 목록 */}
        <BreedSelectList
          className='px-4'
          query={searchTerm}
          breeds={breeds}
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
  onSearch?: (value: string) => void;
  onSelect?: (breed: Breed) => void;
}

function BreedSelectList({ className, query, breeds = [], onSearch, onSelect }: BreedSelectListProps) {
  return (
    <div className={className}>
      <div className='border-line-200 border-b py-3'>
        <TextField
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch?.(e.target.value)}
          variant='secondary'
          prefix={<Icon icon='Search' />}
        >
          <TextFieldInput placeholder='견종을 검색해 보세요' />
        </TextField>
      </div>

      <ul className='scrollbar-hide flex h-[calc(100vh-250px)] flex-col overflow-y-auto'>
        {breeds.map((breed) => (
          <button
            key={breed.breedId}
            type='button'
            className='gap-x2 border-line-200 active:bg-fill-secondary-50 flex items-center border-b py-4'
            onClick={() => onSelect?.(breed)}
          >
            <li className='body1-medium text-text-primary text-start'>
              {TextHighlights(breed.breedName, query ?? '')}
            </li>
          </button>
        ))}
      </ul>
    </div>
  );
}

export { BreedSelector };

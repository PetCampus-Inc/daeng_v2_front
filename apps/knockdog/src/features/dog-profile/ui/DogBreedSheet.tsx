'use client';

import React from 'react';
import { TextField, TextFieldInput, Icon } from '@knockdog/ui';
import type { Breed } from '../model/breed.type';
import { useBreedSearch } from '../model/useBreedSearch';
import { TextHighlights } from '@shared/ui/text-highlights';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface DogBreedSheetProps {
  isOpen: boolean;
  close: () => void;
  onSelectBreed: (breed: Breed) => void;
}

export const DogBreedSheet = ({ isOpen, close, onSelectBreed }: DogBreedSheetProps) => {
  const { breeds, searchTerm, setSearchTerm } = useBreedSearch();

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) {
      close();
    }
  };

  const handleSelectBreed = (breed: Breed) => () => {
    onSelectBreed(breed);
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className=''>
          <BottomSheet.Title>견종 선택</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>
        <div className='px-4'>
          <div className='border-line-200 border-b py-3'>
            <TextField
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              variant='secondary'
              prefix={<Icon icon='Search' />}
            >
              <TextFieldInput placeholder='견종을 검색해 보세요' />
            </TextField>
          </div>

          <ul className='scrollbar-hide flex h-[calc(100vh-250px)] flex-col overflow-y-auto'>
            {breeds?.map((breed) => (
              <button
                key={breed.breedId}
                className='gap-x2 border-line-200 active:bg-fill-secondary-50 flex items-center border-b py-4'
                onClick={handleSelectBreed(breed)}
              >
                <li className='body1-medium text-text-primary text-start'>
                  {TextHighlights(breed.breedName, searchTerm)}
                </li>
              </button>
            ))}
          </ul>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

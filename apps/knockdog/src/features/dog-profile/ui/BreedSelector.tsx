'use client';

import { TextField, TextFieldInput, Icon, IconButton } from '@knockdog/ui';
import { useState } from 'react';
import { DogBreedSheet } from './DogBreedSheet';
import type { Breed } from '../model/breed.type';

interface BreedSelectorProps {
  breed: Breed | null;
  setBreed: (breed: Breed | null) => void;
}

export const BreedSelector = ({ breed, setBreed }: BreedSelectorProps) => {
  const [isBreedSheetOpen, setIsBreedSheetOpen] = useState(false);

  return (
    <>
      <TextField
        variant='secondary'
        onClick={() => setIsBreedSheetOpen(true)}
        label='견종'
        readOnly
        prefix={<Icon icon='Search' />}
        suffix={
          breed && (
            <IconButton
              icon='DeleteInput'
              onClick={(e) => {
                e.stopPropagation();
                setBreed(null);
              }}
            />
          )
        }
        indicator='(선택)'
      >
        <TextFieldInput
          placeholder='견종을 검색해 보세요'
          value={breed?.breedName}
        />
      </TextField>
      <DogBreedSheet
        isOpen={isBreedSheetOpen}
        close={() => setIsBreedSheetOpen(false)}
        onSelectBreed={setBreed}
      />
    </>
  );
};

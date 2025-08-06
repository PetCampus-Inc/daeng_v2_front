'use client';

import { TextField, TextFieldInput, Icon } from '@knockdog/ui';
import { useState } from 'react';
import { YearSheet } from './YearSheet';

interface YearSelectorProps {
  birthYear: string;
  setBirthYear: (year: string) => void;
}

export const YearSelector = ({
  birthYear,
  setBirthYear,
}: YearSelectorProps) => {
  const [isYearSheetOpen, setIsYearSheetOpen] = useState(false);
  return (
    <>
      <TextField
        readOnly
        label='태어난 해'
        value={birthYear}
        indicator='(선택)'
        suffix={<Icon icon='ChevronBottom' />}
        onClick={() => setIsYearSheetOpen(true)}
      >
        <TextFieldInput
          placeholder='년도를 선택해 주세요'
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
        />
      </TextField>
      <YearSheet
        isOpen={isYearSheetOpen}
        close={() => setIsYearSheetOpen(false)}
        year={birthYear}
        onSelectYear={setBirthYear}
      />
    </>
  );
};

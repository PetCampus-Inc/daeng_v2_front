'use client';

import React from 'react';
import { BottomSheet } from '@knockdog/ui';

interface YearSheetProps {
  isOpen: boolean;
  close: () => void;
  year?: string;
  onSelectYear: (year: string) => void;
}

// 현재 년도를 기준으로 30년 전까지
const years = Array.from({ length: 30 }, (_, index) => {
  const year = new Date().getFullYear() - index;
  return String(year);
});

export const YearSheet = ({ isOpen, close, onSelectYear, year: selectedYear }: YearSheetProps) => {
  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) {
      close();
    }
  };

  const handleYear = (year: string) => () => {
    onSelectYear(year);
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-200 border-b'>
          <BottomSheet.Title>년도 선택</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>
        <div className='px-4'>
          <ul className='scrollbar-hide flex h-[50vh] flex-col overflow-y-auto'>
            {years?.map((year) => (
              <button
                key={year}
                className='gap-x2 border-line-200 active:text-text-accent flex items-center border-b py-4'
                onClick={handleYear(year)}
              >
                <li className='body1-medium text-text-primary text-start'>
                  {selectedYear === year ? <span className='text-text-accent'>{year}</span> : year}
                </li>
              </button>
            ))}
          </ul>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

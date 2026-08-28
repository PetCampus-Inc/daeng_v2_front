'use client';

import React from 'react';
import { Divider } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumViewMode } from '@views/guardian-album-page/model/guardianAlbumViewMode';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useNativeBackToClose } from '@shared/lib/bridge';

interface GuardianAlbumFilterSheetProps {
  isOpen: boolean;
  close: () => void;
  currentViewMode: GuardianAlbumViewMode;
  onSelect: (viewMode: GuardianAlbumViewMode) => void;
}

function GuardianAlbumFilterSheet({
  isOpen,
  close,
  currentViewMode,
  onSelect,
}: GuardianAlbumFilterSheetProps) {
  const { filterSheet } = guardianAlbumContent;

  useNativeBackToClose(isOpen, close);

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelect = (viewMode: GuardianAlbumViewMode) => {
    onSelect(viewMode);
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>{filterSheet.title}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='py-5 pb-10'>
          {filterSheet.options.map((option, index) => {
            const isSelected = currentViewMode === option.value;

            return (
              <React.Fragment key={option.value}>
                <button
                  type='button'
                  className='flex w-full items-center px-4 py-4 text-left'
                  onClick={() => handleSelect(option.value)}
                >
                  <span
                    className={cn(
                      'body1-medium w-full',
                      isSelected ? 'text-text-accent' : 'text-text-primary'
                    )}
                  >
                    {option.label}
                  </span>
                </button>
                {index < filterSheet.options.length - 1 ? (
                  <div className='px-4'>
                    <Divider />
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianAlbumFilterSheet };

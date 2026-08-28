'use client';

import { useEffect, useState } from 'react';
import { ActionButton } from '@knockdog/ui';

import { ownerAlbumContent } from '@views/owner-album-page/config/ownerAlbumContent';

import { BottomSheet } from '@shared/ui/bottom-sheet';

interface OwnerAlbumInfoSheetProps {
  isOpen: boolean;
  close: () => void;
}

function OwnerAlbumInfoSheet({ isOpen, close }: OwnerAlbumInfoSheetProps) {
  const { infoSheet } = ownerAlbumContent;
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  useEffect(() => {
    const handleNativeTabBlur = () => {
      setShouldRender(false);
      close();
    };

    window.addEventListener('knockdog:native-tab-will-blur', handleNativeTabBlur);
    window.addEventListener('knockdog:native-tab-blur', handleNativeTabBlur);

    return () => {
      window.removeEventListener('knockdog:native-tab-will-blur', handleNativeTabBlur);
      window.removeEventListener('knockdog:native-tab-blur', handleNativeTabBlur);
    };
  }, [close]);

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  if (!shouldRender) return null;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-center justify-between'>
          <BottomSheet.Title>{infoSheet.title}</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <BottomSheet.Content className='px-x6 py-x4'>
          <ul className='flex flex-col gap-y-2'>
            {infoSheet.notices.map((notice) => (
              <li key={notice} className='body1-medium text-text-primary flex gap-x-2'>
                <span className='mt-[0.55em] size-1 shrink-0 rounded-full bg-current' aria-hidden />
                <span className='min-w-0 flex-1'>{notice}</span>
              </li>
            ))}
          </ul>
        </BottomSheet.Content>

        <BottomSheet.Footer>
          <ActionButton type='button' variant='primaryFill' size='large' className='w-full' onClick={close}>
            {infoSheet.confirmLabel}
          </ActionButton>
        </BottomSheet.Footer>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerAlbumInfoSheet };

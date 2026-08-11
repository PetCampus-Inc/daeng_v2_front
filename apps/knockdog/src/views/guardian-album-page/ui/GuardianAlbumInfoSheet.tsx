'use client';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface GuardianAlbumInfoSheetProps {
  isOpen: boolean;
  close: () => void;
}

function GuardianAlbumInfoSheet({ isOpen, close }: GuardianAlbumInfoSheetProps) {
  const { infoSheet } = guardianAlbumContent;

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>{infoSheet.title}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <BottomSheet.Content className='px-4 pt-5 pb-10'>
          <ul className='flex flex-col gap-4'>
            {infoSheet.notices.map((notice) => (
              <li key={notice} className='body1-medium text-text-primary flex gap-2'>
                <span className='mt-[0.55em] size-1 shrink-0 rounded-full bg-current' aria-hidden />
                <span className='min-w-0 flex-1'>{notice}</span>
              </li>
            ))}
          </ul>
        </BottomSheet.Content>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianAlbumInfoSheet };

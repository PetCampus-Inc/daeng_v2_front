'use client';

import { useEffect, useState } from 'react';
import { ActionButton } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface OwnerKindergartenNewsWriteSettingsSheetProps {
  isOpen: boolean;
  close: () => void;
}

/** 글쓰기 설정 시트 — UI 스텀 (설정 항목은 이후 연동) */
function OwnerKindergartenNewsWriteSettingsSheet({
  isOpen,
  close,
}: OwnerKindergartenNewsWriteSettingsSheetProps) {
  const { write } = ownerKindergartenNewsContent;
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <BottomSheet.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-center justify-between px-4!'>
          <BottomSheet.Title>{write.settingsSheetTitle}</BottomSheet.Title>
          <BottomSheet.CloseButton aria-label={write.settingsSheetCloseLabel} />
        </BottomSheet.Header>
        <BottomSheet.Content className='px-4 py-6'>
          <p className='body1-regular text-text-secondary text-center'>{write.settingsSheetPlaceholder}</p>
        </BottomSheet.Content>
        <BottomSheet.Footer>
          <ActionButton type='button' variant='primaryFill' size='large' className='w-full' onClick={close}>
            {write.settingsSheetCloseLabel}
          </ActionButton>
        </BottomSheet.Footer>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerKindergartenNewsWriteSettingsSheet };

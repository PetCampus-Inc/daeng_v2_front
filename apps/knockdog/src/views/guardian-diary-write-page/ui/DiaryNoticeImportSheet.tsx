'use client';

import { ActionButton, DiaryKindergartenNote } from '@knockdog/ui';

import { BottomSheet } from '@shared/ui/bottom-sheet';

import { getDiaryImportSheetCopy } from '../lib/diaryWriteForm';

interface DiaryNoticeImportSheetProps {
  isOpen: boolean;
  hasPhoto: boolean;
  date: string;
  onClose: () => void;
  onAddToDiary: () => void;
  onCreateDiary: () => void;
}

function DiaryNoticeImportSheet({
  isOpen,
  hasPhoto,
  date,
  onClose,
  onAddToDiary,
  onCreateDiary,
}: DiaryNoticeImportSheetProps) {
  const copy = getDiaryImportSheetCopy(hasPhoto);

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-start'>
          <BottomSheet.Title>
            {copy.title}
            <br />
            {copy.description}
          </BottomSheet.Title>
        </BottomSheet.Header>
        <div className='px-x6 pt-x1 pb-x3'>
          <DiaryKindergartenNote date={date} isPreview />
        </div>
        <div className='p-x4 flex gap-x2'>
          {copy.secondaryLabel ? (
            <div className='min-w-0 flex-1'>
              <ActionButton type='button' variant='primaryLine' size='large' onClick={onAddToDiary}>
                {copy.secondaryLabel}
              </ActionButton>
            </div>
          ) : null}
          <div className='min-w-0 flex-1'>
            <ActionButton
              type='button'
              variant='primaryFill'
              size='large'
              onClick={hasPhoto ? onCreateDiary : onAddToDiary}
            >
              {copy.primaryLabel}
            </ActionButton>
          </div>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { DiaryNoticeImportSheet };
export type { DiaryNoticeImportSheetProps };

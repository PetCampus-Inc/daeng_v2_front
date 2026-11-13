'use client';

import { BottomSheet } from '@shared/ui/bottom-sheet';

interface DiaryPhotoSourceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (source: 'library' | 'camera') => void;
}

function DiaryPhotoSourceSheet({ isOpen, onClose, onSelect }: DiaryPhotoSourceSheetProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onClose} modal={false}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-200 border-b'>
          <BottomSheet.Title>이미지 소스 선택</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='py-x5 flex flex-col pb-[40px]'>
          <button
            type='button'
            className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
            onClick={() => onSelect('library')}
          >
            사진 보관함
          </button>
          <button
            type='button'
            className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
            onClick={() => onSelect('camera')}
          >
            카메라로 촬영하기
          </button>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { DiaryPhotoSourceSheet };

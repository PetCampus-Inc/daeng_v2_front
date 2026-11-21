import { useState, useEffect } from 'react';
import { IconButton } from '@knockdog/ui';
import { FullImageSlider } from '@shared/ui/full-image-slider';
import { BottomSheet } from '../bottom-sheet';

import { openRemovePhotoDialog } from './openRemovePhotoDialog';

interface PriceFullImageSheetProps {
  isOpen: boolean;
  close: () => void;
  images: string[];
  initialIndex?: number;
  onRemove?: (index: number) => void;
}

export function FullImageSheet({ isOpen, close, images = [], initialIndex = 0, onRemove }: PriceFullImageSheetProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
  }, [initialIndex]);

  function handleRemove() {
    onRemove?.(currentIndex);
    close();
  }

  return (
    // AlertDialog가 open되어, dim영역 클릭시 이벤트 버블링으로인해 BottomSheet가 닫히는 현상을 방지하기 위해 dismissible={false} 설정
    <BottomSheet.Root open={isOpen} onOpenChange={close} dismissible={false}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body
        className='z-modal flex h-dvh max-h-dvh flex-col rounded-none'
        aria-describedby={'유치원 가격 정보'}
      >
        <BottomSheet.Header className='shrink-0 justify-between pt-[50px]'>
          <IconButton icon='Close' onClick={close} />

          <BottomSheet.Title />

          <IconButton icon='Trash' onClick={() => void openRemovePhotoDialog(handleRemove)} />
        </BottomSheet.Header>
        <BottomSheet.Content className='min-h-0 flex-1'>
          <FullImageSlider initialIndex={initialIndex} images={images} onIndexChange={setCurrentIndex} />
        </BottomSheet.Content>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

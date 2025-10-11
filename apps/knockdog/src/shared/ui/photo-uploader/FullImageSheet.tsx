import { useState, useEffect } from 'react';
import {
  BottomSheet,
  IconButton,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@knockdog/ui';
import { FullImageSlider } from '@shared/ui/full-image-slider';

interface PriceFullImageSheetProps {
  isOpen: boolean;
  close: () => void;
  images: string[];
  initialIndex?: number;
  onRemove?: (index: number) => void;
}

export function FullImageSheet({ isOpen, close, images = [], initialIndex = 0, onRemove }: PriceFullImageSheetProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
  }, [initialIndex]);

  function handleRemove() {
    onRemove?.(currentIndex);
    setIsAlertOpen(false);
    close();
  }

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal h-screen max-h-screen rounded-none' aria-describedby={'유치원 가격 정보'}>
        <BottomSheet.Header className='justify-between'>
          <IconButton icon='Close' onClick={close} />

          <BottomSheet.Title></BottomSheet.Title>

          <IconButton icon='Trash' onClick={() => setIsAlertOpen(true)} />
        </BottomSheet.Header>
        <BottomSheet.Content>
          <FullImageSlider initialIndex={initialIndex} images={images} onIndexChange={setCurrentIndex} />
        </BottomSheet.Content>
      </BottomSheet.Body>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className='z-[9999]' overlayClassName='z-[9998]'>
          <AlertDialogHeader>
            <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BottomSheet.Root>
  );
}

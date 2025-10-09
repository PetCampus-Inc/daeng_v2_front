import { BottomSheet, IconButton } from '@knockdog/ui';
import { FullImageSlider } from '@shared/ui/full-image-slider';

interface PriceFullImageSheetProps {
  isOpen: boolean;
  close: () => void;
  images: string[];
  initialIndex?: number;
}

export function PriceFullImageSheet({ isOpen, close, images = [], initialIndex = 0 }: PriceFullImageSheetProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal h-screen max-h-screen rounded-none' aria-describedby={'유치원 가격 정보'}>
        <BottomSheet.Header className='justify-between'>
          <IconButton icon='ChevronLeft' onClick={close} />

          <BottomSheet.Title></BottomSheet.Title>

          <IconButton icon='Share' />
        </BottomSheet.Header>
        <BottomSheet.Content>
          <FullImageSlider
            initialIndex={initialIndex}
            images={images.map((image) => `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${image}`)}
          />
        </BottomSheet.Content>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

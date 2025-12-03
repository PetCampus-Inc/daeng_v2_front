import { BottomSheet } from '@knockdog/ui';
import type { DogSchoolWithMeta } from '../model/mappers';

interface DogSchoolDetailProps {
  isOpen: boolean;
  shouldAnimate?: boolean;
  onDetailCloseStart?: () => void;
  onExit?: () => void;
  data: DogSchoolWithMeta;
}

export function KindergartenDetailSheet({
  isOpen,
  shouldAnimate = true,
  onDetailCloseStart,
  onExit,
  data,
}: DogSchoolDetailProps) {
  const handleClose = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <div>
      <BottomSheet.Root
        open={isOpen}
        onOpenChange={handleClose}
        onTransitionStart={onDetailCloseStart}
        // closeThreshold={0.5}
        shouldAnimate={shouldAnimate}
      >
        <BottomSheet.Portal>
          <BottomSheet.Body className='absolute inset-x-0 z-50 h-full max-h-full'>
            <BottomSheet.Title className='sr-only'>{data.title} 상세</BottomSheet.Title>
            <div className='p-6'>
              <h1 className='mb-4 text-2xl font-bold'>{data.title}</h1>
              <p className='mb-2 text-gray-600'>거리: {data.dist}</p>
              <p className='text-gray-600'>주소: {data.id}</p>
              <div className='mt-8'>
                <h2 className='mb-4 text-lg font-semibold'>상세 정보</h2>
                <p>여기에 상세 정보가 표시됩니다.</p>
              </div>
            </div>
          </BottomSheet.Body>
        </BottomSheet.Portal>
      </BottomSheet.Root>
    </div>
  );
}

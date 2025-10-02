import { BottomSheet, Icon } from '@knockdog/ui';

interface DeparturePointSheetProps {
  isOpen: boolean;
  close: () => void;
}

export function DeparturePointSheet({
  isOpen,
  close,
}: DeparturePointSheetProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>어디서 출발하시나요?</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='py-x5 flex flex-col'>
          <button className='p-x4 gap-x2 border-line-200 active:bg-fill-secondary-50 flex items-center border-b'>
            <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
            <div className='gap-x0_5 flex flex-col text-start'>
              <p className='body1-extrabold text-text-primary'>현재 위치</p>
              <span className='body2-regular text-text-secondary'>
                서울 강남구 논현로
              </span>
            </div>
          </button>
          <button className='p-x4 gap-x2 border-line-200 active:bg-fill-secondary-50 flex items-center border-b'>
            <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
            <div className='gap-x0_5 flex flex-col text-start'>
              <p className='body1-extrabold text-text-primary'>집</p>
              <span className='body2-regular text-text-secondary'>
                서울 강남구 논현로
              </span>
            </div>
          </button>
          <button className='p-x4 gap-x2 border-line-200 active:bg-fill-secondary-50 flex items-center border-b'>
            <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
            <div className='gap-x0_5 flex flex-col text-start'>
              <p className='body1-extrabold text-text-primary'>직장</p>
              <span className='body2-regular text-text-secondary'>
                서울 강남구 논현로
              </span>
            </div>
          </button>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

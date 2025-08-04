import { BottomSheet } from '@knockdog/ui';

interface PhoneCallSheetProps {
  isOpen: boolean;
  close: () => void;
}

export function PhoneCallSheet({ isOpen, close }: PhoneCallSheetProps) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>0507-1234-5678</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='py-x5 flex flex-col'>
          <button className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'>
            전화 걸기
          </button>
          <button className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'>
            전화번호 복사하기
          </button>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

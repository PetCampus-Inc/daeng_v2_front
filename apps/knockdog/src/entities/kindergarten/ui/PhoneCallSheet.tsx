import { BottomSheet } from '@knockdog/ui';
import { useCopyToClipboard } from '@shared/lib/react';

interface PhoneCallSheetProps {
  phoneNumber: string;
  isOpen: boolean;
  close: () => void;
}

export function PhoneCallSheet({ phoneNumber = '010-1234-5678', isOpen, close }: PhoneCallSheetProps) {
  const { copy } = useCopyToClipboard();

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>{phoneNumber}</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='py-x5 flex flex-col'>
          <button className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'>
            <a href={`tel:${phoneNumber}`}>전화 걸기</a>
          </button>
          <button
            className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
            onClick={() => copy(phoneNumber)}
          >
            전화번호 복사하기
          </button>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

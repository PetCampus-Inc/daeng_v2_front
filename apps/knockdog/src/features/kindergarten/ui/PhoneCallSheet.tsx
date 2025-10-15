import { BottomSheet } from '@knockdog/ui';
import { useCallPhone, useClipboardCopy } from '@shared/lib/device';

interface PhoneCallSheetProps {
  phoneNumber: string;
  isOpen: boolean;
  close: () => void;
}

export function PhoneCallSheet({ phoneNumber = '010-1234-5678', isOpen, close }: PhoneCallSheetProps) {
  const callPhone = useCallPhone();
  const copy = useClipboardCopy();

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
          <button
            onClick={() => callPhone(phoneNumber)}
            className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
          >
            전화 걸기
          </button>
          <button
            className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
            onClick={async () => await copy(phoneNumber)}
          >
            전화번호 복사하기
          </button>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

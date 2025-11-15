import { BottomSheet } from '@shared/ui/bottom-sheet';
import { CONSENT_TEXT } from '../lib/consent';

function MarketingConsentSheet({ isOpen, close }: { isOpen: boolean; close: () => void }) {
  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Body>
        <BottomSheet.Handle />
        <BottomSheet.Header className='justify-between'>
          <BottomSheet.Title>마케팅 정보 수신 동의</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <BottomSheet.Content className='max-h-[60dvh] overflow-y-auto'>
          <p className='body2-regular text-text-secondary whitespace-pre-line'>{CONSENT_TEXT}</p>
        </BottomSheet.Content>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { MarketingConsentSheet };

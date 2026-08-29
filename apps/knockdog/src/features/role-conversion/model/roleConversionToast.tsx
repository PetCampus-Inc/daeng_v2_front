import { toast } from '@shared/ui/toast';

export function showConvertedToGuardianToast() {
  toast({
    type: 'success',
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: '보호자로 전환됐어요',
    titleParts: [
      { text: '보호자', accent: true },
      { text: '로 전환됐어요' },
    ],
    title: (
      <>
        <span className='body1-bold text-text-accent'>보호자</span>
        <span className='body1-medium text-text-primary-inverse'>로 전환됐어요</span>
      </>
    ),
  });
}

export function showConvertedToOwnerToast() {
  toast({
    type: 'success',
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: '원장으로 전환됐어요',
    titleParts: [
      { text: '원장', accent: true },
      { text: '으로 전환됐어요' },
    ],
    title: (
      <>
        <span className='body1-bold text-text-accent'>원장</span>
        <span className='body1-medium text-text-primary-inverse'>으로 전환됐어요</span>
      </>
    ),
  });
}

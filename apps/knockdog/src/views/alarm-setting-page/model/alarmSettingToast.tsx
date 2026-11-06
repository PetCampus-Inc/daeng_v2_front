import { toast } from '@shared/ui/toast';

function showActivateAlarmToast() {
  toast({
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: '알림 받기를 활성화 시 설정할 수 있어요',
    titleParts: [
      { text: '알림 받기를 ' },
      { text: '활성화', accent: true },
      { text: ' 시 설정할 수 있어요' },
    ],
    title: (
      <span>
        <span className='body1-medium text-text-primary-inverse'>알림 받기를 </span>
        <span className='body1-bold text-text-accent'>활성화</span>
        <span className='body1-medium text-text-primary-inverse'> 시 설정할 수 있어요</span>
      </span>
    ),
  });
}

function showOwnerVerificationToast() {
  toast({
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: '원장 알림은 원장님 인증 시 설정할 수 있어요',
    titleParts: [
      { text: '원장 알림은 ' },
      { text: '원장님 인증', accent: true },
      { text: ' 시 설정할 수 있어요' },
    ],
    title: (
      <span>
        <span className='body1-medium text-text-primary-inverse'>원장 알림은 </span>
        <span className='body1-bold text-text-accent'>원장님 인증</span>
        <span className='body1-medium text-text-primary-inverse'> 시 설정할 수 있어요</span>
      </span>
    ),
  });
}

export { showActivateAlarmToast, showOwnerVerificationToast };

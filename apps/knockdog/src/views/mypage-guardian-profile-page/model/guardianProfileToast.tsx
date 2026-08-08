import { toast } from '@shared/ui/toast';

export function showGuardianProfileSaveSuccessToast() {
  toast({
    type: 'success',
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: '변경사항이 저장됐어요',
    titleParts: [
      { text: '변경사항이', accent: true },
      { text: ' 저장됐어요' },
    ],
    title: (
      <>
        <span className='body1-bold text-text-accent'>변경사항이</span>
        <span className='body1-medium text-text-primary-inverse'> 저장됐어요</span>
      </>
    ),
  });
}

export function showGuardianProfileSaveFailureToast() {
  toast({
    title: '일시적 오류로 요청을 완료하지 못했어요',
    nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
  });
}

import { toast } from '@shared/ui/toast';

export function showOwnerHomeRefreshedToast() {
  toast({
    type: 'success',
    shape: 'rounded',
    position: 'bottom',
    nativeTitle: '새로고침 되었습니다',
    titleParts: [
      { text: '새로고침', accent: true },
      { text: ' 되었습니다' },
    ],
    title: (
      <>
        <span className='body1-bold text-text-accent'>새로고침</span>
        <span className='body1-medium text-text-primary-inverse'> 되었습니다</span>
      </>
    ),
  });
}

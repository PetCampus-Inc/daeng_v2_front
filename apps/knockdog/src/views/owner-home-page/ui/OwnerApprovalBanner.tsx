import { Icon } from '@knockdog/ui';

interface OwnerApprovalBannerProps {
  pendingCount: number;
  onClick: () => void;
  onClose: () => void;
}

function OwnerApprovalBanner({ pendingCount, onClick, onClose }: OwnerApprovalBannerProps) {
  if (pendingCount <= 0) return null;

  return (
    <div className='bg-bg-0 flex h-14 w-full items-center justify-between p-4'>
      <button type='button' className='gap-x1 flex h-6 items-center text-left' onClick={onClick}>
        <span className='flex size-6 shrink-0 items-center justify-center'>
          <Icon icon='AlertFill' className='text-fill-primary-500 size-6' />
        </span>
        <div className='gap-x0_5 flex h-5 items-center'>
          <span className='body2-bold text-text-primary whitespace-nowrap'>연결 승인 대기</span>
          <span className='body2-extrabold text-text-accent whitespace-nowrap'>{pendingCount}건</span>
        </div>
      </button>
      <button
        type='button'
        className='flex size-6 shrink-0 items-center justify-center'
        aria-label='연결 승인 대기 배너 닫기'
        onClick={onClose}
      >
        <Icon icon='Close' className='text-fill-secondary-700 size-6' />
      </button>
    </div>
  );
}

export { OwnerApprovalBanner };

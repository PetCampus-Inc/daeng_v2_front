import { Icon } from '@knockdog/ui';

interface OwnerApprovalBannerProps {
  isClosing?: boolean;
  onClick: () => void;
  onClose: () => void;
}

const APPROVAL_PENDING_LABEL = '새로운 원생 신청이 있어요!';
const BANNER_CLOSE_LABEL = '배너 닫기';

const OwnerApprovalBanner = ({ onClick, onClose, isClosing = false }: OwnerApprovalBannerProps) => {
  return (
    <div className='bg-bg-0 radius-r4 px-x4 py-x3 flex min-h-14 w-full items-center justify-between'>
      <button
        type='button'
        className='gap-x1 flex h-6 min-w-0 flex-1 items-center justify-start text-left'
        onClick={onClick}
      >
        <span className='flex size-6 shrink-0 items-center justify-center'>
          <Icon icon='Notification' className='text-text-accent size-6' />
        </span>
        <div className='gap-x0_5 flex h-5 min-w-0 items-center justify-start text-left'>
          <span className='body1-medium text-text-primary'>{APPROVAL_PENDING_LABEL}</span>
        </div>
      </button>
      <button
        type='button'
        className='flex size-6 shrink-0 items-center justify-center'
        aria-label={BANNER_CLOSE_LABEL}
        disabled={isClosing}
        onClick={onClose}
      >
        <Icon icon='Close' className='text-fill-secondary-700 size-6' />
      </button>
    </div>
  );
};

export { OwnerApprovalBanner };

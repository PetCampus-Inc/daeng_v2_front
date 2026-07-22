import { Icon } from '@knockdog/ui';

interface OwnerApprovalBannerProps {
  isError?: boolean;
  pendingCount: number;
  onClick: () => void;
  onClose: () => void;
}

const ERROR_MESSAGE = '정보를 불러오지 못했어요';
const APPROVAL_PENDING_LABEL = '연결 승인 대기';
const BANNER_CLOSE_LABEL = '배너 닫기';

function OwnerApprovalBanner({ isError = false, pendingCount, onClick, onClose }: OwnerApprovalBannerProps) {
  return (
    <div className='bg-bg-0 flex h-14 w-full items-center justify-between p-4'>
      {isError ? (
        <p className='text-size-body2 text-text-primary leading-5 font-regular tracking-[-0.006em]'>
          {ERROR_MESSAGE}
        </p>
      ) : (
        <button
          type='button'
          className='gap-x1 flex h-6 min-w-0 flex-1 items-center justify-start text-left'
          onClick={onClick}
        >
          <span className='flex size-6 shrink-0 items-center justify-center'>
            <Icon icon='AlertFill' className='text-fill-primary-500 size-6' />
          </span>
          <div className='gap-x0_5 flex h-5 min-w-0 items-center justify-start text-left'>
            <span className='text-size-body2 text-text-primary leading-5 font-bold tracking-[-0.006em] whitespace-nowrap'>
              {APPROVAL_PENDING_LABEL}
            </span>
            <span className='text-size-body2 text-text-accent leading-5 font-extrabold tracking-[-0.01em] whitespace-nowrap'>
              {pendingCount}건
            </span>
          </div>
        </button>
      )}
      <button
        type='button'
        className='flex size-6 shrink-0 items-center justify-center'
        aria-label={BANNER_CLOSE_LABEL}
        onClick={onClose}
      >
        <Icon icon='Close' className='text-fill-secondary-700 size-6' />
      </button>
    </div>
  );
}

export { OwnerApprovalBanner };

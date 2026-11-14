import { ActionButton } from '@knockdog/ui';

import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

interface OwnerHomeDataStateProps {
  isLoading: boolean;
  isRetrying: boolean;
  onRetry: () => void;
}

const OwnerHomeDataState = ({ isLoading, isRetrying, onRetry }: OwnerHomeDataStateProps) => (
  <div
    className='bg-bg-0 radius-r5 gap-x3 p-x4 relative flex min-h-[180px] flex-col items-center justify-center text-center'
    aria-live='polite'
  >
    {isLoading ? (
      <DelayedLoadingSpinner isLoading layout='inline' />
    ) : (
      <>
        <p className='body2-semibold text-text-primary'>정보를 불러오지 못했어요</p>
        <p className='caption1-regular text-text-secondary'>잠시 후 다시 시도해 주세요.</p>
        <ActionButton variant='secondaryLine' size='small' disabled={isRetrying} onClick={onRetry}>
          다시 시도하기
        </ActionButton>
      </>
    )}
  </div>
);

export { OwnerHomeDataState };

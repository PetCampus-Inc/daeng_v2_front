import { ACTION_LOADING_DELAY_MS } from './constants';
import { useDelayedLoading } from './useDelayedLoading';

function useActionLoading(isPending: boolean, delayMs = ACTION_LOADING_DELAY_MS) {
  const showSpinner = useDelayedLoading(isPending, delayMs);

  return {
    showSpinner,
    isLocked: isPending,
  };
}

export { useActionLoading };

'use client';

import { LOADING_SPINNER_DELAY_MS } from '../lib/constants';
import { useDelayedLoading } from '../lib/useDelayedLoading';
import type { DelayedLoadingSpinnerProps } from '../model/types';
import { LoadingSpinner } from './LoadingSpinner';

function DelayedLoadingSpinner({
  isLoading,
  delayMs = LOADING_SPINNER_DELAY_MS,
  ...spinnerProps
}: DelayedLoadingSpinnerProps) {
  const showLoading = useDelayedLoading(isLoading, delayMs);

  if (!showLoading) return null;

  return <LoadingSpinner {...spinnerProps} />;
}

export { DelayedLoadingSpinner };

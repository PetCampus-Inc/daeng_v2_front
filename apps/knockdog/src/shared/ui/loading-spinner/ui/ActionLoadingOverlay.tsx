'use client';

import { cn } from '@knockdog/ui/lib';
import { useActionLoading } from '../lib/useActionLoading';
import { LoadingSpinner } from './LoadingSpinner';

interface ActionLoadingOverlayProps {
  isPending: boolean;
  className?: string;
}

function ActionLoadingOverlay({ isPending, className }: ActionLoadingOverlayProps) {
  const { showSpinner, isLocked } = useActionLoading(isPending);

  if (!isLocked) return null;

  return (
    <div className={cn('absolute inset-0 z-10 flex items-center justify-center bg-white/80', className)}>
      {showSpinner ? <LoadingSpinner layout='inline' /> : null}
    </div>
  );
}

export { ActionLoadingOverlay };

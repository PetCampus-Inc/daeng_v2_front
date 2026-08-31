'use client';

import { cn } from '@knockdog/ui/lib';
import { useActionLoading } from '../lib/useActionLoading';
import { LoadingSpinner } from './LoadingSpinner';

interface ActionLoadingOverlayProps {
  isPending: boolean;
  className?: string;
}

function ActionLoadingOverlay({ isPending, className }: ActionLoadingOverlayProps) {
  const { showSpinner } = useActionLoading(isPending);

  if (!showSpinner) return null;

  return (
    <div className={cn('absolute inset-0 z-10 flex items-center justify-center bg-white/80', className)}>
      <LoadingSpinner layout='inline' />
    </div>
  );
}

export { ActionLoadingOverlay };

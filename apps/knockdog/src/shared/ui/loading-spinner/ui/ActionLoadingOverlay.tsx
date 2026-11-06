'use client';

import { cn } from '@knockdog/ui/lib';
import { ACTION_LOADING_DELAY_MS } from '../lib/constants';
import { useActionLoading } from '../lib/useActionLoading';
import { LoadingSpinner } from './LoadingSpinner';

interface ActionLoadingOverlayProps {
  isPending: boolean;
  /** 흰 배경과 Spinner를 보이기까지 기다리는 시간. 그동안은 투명한 막으로 화면만 잠근다 */
  delayMs?: number;
  className?: string;
}

/** 등록·수정·삭제 진행 중 화면을 잠근다 */
function ActionLoadingOverlay({ isPending, delayMs = ACTION_LOADING_DELAY_MS, className }: ActionLoadingOverlayProps) {
  const { showSpinner, isLocked } = useActionLoading(isPending, delayMs);

  if (!isLocked) return null;

  // 지연 시간이 없으면 기존처럼 처음부터 흰 배경을 깐다
  const isDimmed = delayMs <= 0 || showSpinner;

  return (
    <div
      className={cn('absolute inset-0 z-10 flex items-center justify-center', isDimmed && 'bg-white/80', className)}
    >
      {showSpinner ? <LoadingSpinner layout='inline' /> : null}
    </div>
  );
}

export { ActionLoadingOverlay };

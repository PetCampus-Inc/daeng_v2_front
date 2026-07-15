'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';

import { ownerMypageContent } from '@features/role-conversion';
import { RingLoadingSpinner } from '@shared/ui/loading-spinner';

const MESSAGE_SWAP_MS = 2000;

interface AutofillLoadingDialogProps {
  isOpen: boolean;
  durationMs?: number;
  /**
   * applySelectedPrefill 가능 여부
   * false면 duration 경과 후에도 준비될 때까지 대기.
   */
  getIsPrefillReady?: () => boolean;
  onCancel: () => void;
  onComplete: () => void;
}

function AutofillLoadingDialog({
  isOpen,
  durationMs = 5000,
  getIsPrefillReady,
  onCancel,
  onComplete,
}: AutofillLoadingDialogProps) {
  const [isAlmostDone, setIsAlmostDone] = useState(false);
  const [hasMinDurationElapsed, setHasMinDurationElapsed] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const getIsPrefillReadyRef = useRef(getIsPrefillReady);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    getIsPrefillReadyRef.current = getIsPrefillReady;
  }, [getIsPrefillReady]);

  useEffect(() => {
    if (!isOpen) {
      completedRef.current = false;
      setHasMinDurationElapsed(false);
      return;
    }

    // 열릴 때만 리셋. 닫힐 때 리셋하면 exit 중 이전 문구가 다시 깜빡임
    setIsAlmostDone(false);
    setHasMinDurationElapsed(false);
    completedRef.current = false;

    const swapTimerId = window.setTimeout(() => {
      setIsAlmostDone(true);
    }, MESSAGE_SWAP_MS);

    const durationTimerId = window.setTimeout(() => {
      setHasMinDurationElapsed(true);
    }, durationMs);

    return () => {
      window.clearTimeout(swapTimerId);
      window.clearTimeout(durationTimerId);
    };
  }, [isOpen, durationMs]);

  // duration + basic/main 준비 완료 후에만 onComplete (타이머만으로 프리필 금지)
  useEffect(() => {
    if (!isOpen || !hasMinDurationElapsed) return;
    if (completedRef.current) return;

    const tryComplete = () => {
      if (completedRef.current) return true;
      const isReady = getIsPrefillReadyRef.current?.() ?? true;
      if (!isReady) return false;
      completedRef.current = true;
      onCompleteRef.current();
      return true;
    };

    if (tryComplete()) return;

    const pollId = window.setInterval(() => {
      if (tryComplete()) window.clearInterval(pollId);
    }, 100);

    return () => window.clearInterval(pollId);
  }, [isOpen, hasMinDurationElapsed]);

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    if (completedRef.current) return;
    onCancel();
  };

  const message = isAlmostDone
    ? ownerMypageContent.kindergartenEditAutofillLoadingDescription
    : ownerMypageContent.kindergartenEditAutofillLoadingTitle;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className='items-center'>
          <RingLoadingSpinner />
          <AlertDialogTitle>{message}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='w-full'>
            {ownerMypageContent.kindergartenEditAutofillCancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { AutofillLoadingDialog };

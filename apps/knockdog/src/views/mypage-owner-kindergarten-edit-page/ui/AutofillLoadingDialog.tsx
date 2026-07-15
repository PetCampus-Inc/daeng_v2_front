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
  onCancel: () => void;
  onComplete: () => void;
}

function AutofillLoadingDialog({
  isOpen,
  durationMs = 5000,
  onCancel,
  onComplete,
}: AutofillLoadingDialogProps) {
  const [isAlmostDone, setIsAlmostDone] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isOpen) {
      completedRef.current = false;
      return;
    }

    // 열릴 때만 리셋. 닫힐 때 리셋하면 exit 중 이전 문구가 다시 깜빡임
    setIsAlmostDone(false);
    completedRef.current = false;

    const swapTimerId = window.setTimeout(() => {
      setIsAlmostDone(true);
    }, MESSAGE_SWAP_MS);

    const completeTimerId = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onCompleteRef.current();
    }, durationMs);

    return () => {
      window.clearTimeout(swapTimerId);
      window.clearTimeout(completeTimerId);
    };
  }, [isOpen, durationMs]);

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

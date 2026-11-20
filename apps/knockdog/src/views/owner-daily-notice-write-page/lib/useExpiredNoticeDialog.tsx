'use client';

import { useEffect } from 'react';
import { overlay } from 'overlay-kit';

import { ownerDailyNoticeWriteContent } from '@views/owner-daily-notice-write-page/config/ownerDailyNoticeWriteContent';

import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

/**
 * 만료된 알림장 안내창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다.
 * @returns 화면을 벗어날 때 안내창을 거두는 함수
 */
function openExpiredNoticeDialog(onConfirm: () => void) {
  const { expiredTitle, expiredDescription, expiredConfirmLabel } = ownerDailyNoticeWriteContent;
  const confirmCopy = { title: expiredTitle, description: expiredDescription, confirmLabel: expiredConfirmLabel };
  let overlayId: string | null = null;
  let isCancelled = false;

  openConfirmDialog({ ...confirmCopy, showCancelButton: false }).then((result) => {
    if (result.status === 'pending' || isCancelled) return;

    if (result.status === 'resolved') {
      if (result.action === 'confirm') onConfirm();
      return;
    }

    overlayId = overlay.open(({ isOpen, close }) => (
      <ConfirmDialog
        {...confirmCopy}
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          close();
          onConfirm();
        }}
      />
    ));
  });

  return () => {
    isCancelled = true;
    if (overlayId) overlay.unmount(overlayId);
  };
}

function useExpiredNoticeDialog(isExpired: boolean, onConfirm: () => void) {
  useEffect(() => {
    if (!isExpired) return;

    return openExpiredNoticeDialog(onConfirm);
  }, [isExpired, onConfirm]);
}

export { openExpiredNoticeDialog, useExpiredNoticeDialog };

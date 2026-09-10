'use client';

import { overlay } from 'overlay-kit';

import { UnsavedExitAlertDialog } from '@shared/ui/unsaved-exit-alert-dialog/UnsavedExitAlertDialog';

/** OverlayProvider history trap에서 제외 — 가드 pushState와 이중 back/모달 중첩 방지 */
const UNSAVED_EXIT_OVERLAY_ID = '__knockdogUnsavedExit';

interface OpenUnsavedExitDialogOptions {
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
}

let isExitDialogOpen = false;
/** open 예약 무효화 — close 이후 stale overlay.open 방지 */
let openRequestToken = 0;
let pendingOpenFrameId: number | null = null;

function isUnsavedExitDialogOpen() {
  return isExitDialogOpen;
}

function cancelPendingOpen() {
  if (pendingOpenFrameId != null) {
    cancelAnimationFrame(pendingOpenFrameId);
    pendingOpenFrameId = null;
  }
  openRequestToken += 1;
}

function markUnsavedExitDialogClosed() {
  cancelPendingOpen();
  isExitDialogOpen = false;
}

function openUnsavedExitDialog({
  onConfirm,
  title,
  description,
  cancelLabel,
  confirmLabel,
}: OpenUnsavedExitDialogOptions) {
  if (isExitDialogOpen) return;

  isExitDialogOpen = true;
  const requestToken = ++openRequestToken;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  pendingOpenFrameId = requestAnimationFrame(() => {
    pendingOpenFrameId = null;

    // close/markClosed가 rAF 전에 플래그를 내렸거나 토큰이 바뀌면 열지 않음
    if (requestToken !== openRequestToken || !isExitDialogOpen) {
      isExitDialogOpen = false;
      return;
    }

    overlay.open(
      ({ isOpen, close }) => {
        // OverlayProvider popstate 등으로 외부 close 시에도 플래그 해제
        if (!isOpen) {
          isExitDialogOpen = false;
        }

        const handleClose = () => {
          markUnsavedExitDialogClosed();
          close();
        };

        return (
          <UnsavedExitAlertDialog
            isOpen={isOpen}
            close={handleClose}
            onConfirm={() => {
              markUnsavedExitDialogClosed();
              close();
              // overlay close와 같은 틱에서 releaseAndLeave(history.back) 하면
              // Overlay cleanup back과 이중 pop → 모달 재오픈됨. 한 프레임 뒤 이탈.
              requestAnimationFrame(() => {
                onConfirm();
              });
            }}
            title={title}
            description={description}
            cancelLabel={cancelLabel}
            confirmLabel={confirmLabel}
          />
        );
      },
      { overlayId: UNSAVED_EXIT_OVERLAY_ID }
    );
  });
}

export {
  openUnsavedExitDialog,
  isUnsavedExitDialogOpen,
  markUnsavedExitDialogClosed,
  UNSAVED_EXIT_OVERLAY_ID,
};
export type { OpenUnsavedExitDialogOptions };

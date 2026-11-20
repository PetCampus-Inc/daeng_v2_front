import { overlay } from 'overlay-kit';

import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

/** 사진 삭제 확인창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const REMOVE_IMAGE_DIALOG = {
  title: '삭제하시겠습니까?',
  cancelLabel: '취소',
  confirmLabel: '확인',
};

/** 삭제 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다. */
const openRemovePhotoDialog = async (onConfirm: () => void) => {
  const result = await openConfirmDialog(REMOVE_IMAGE_DIALOG);
  if (result.status === 'pending') return;

  if (result.status === 'resolved') {
    if (result.action === 'confirm') onConfirm();
    return;
  }

  overlay.open(({ isOpen, close: closeAlert }) => (
    <ConfirmDialog
      {...REMOVE_IMAGE_DIALOG}
      isOpen={isOpen}
      onClose={closeAlert}
      onConfirm={() => {
        closeAlert();
        onConfirm();
      }}
    />
  ));
};

export { openRemovePhotoDialog };

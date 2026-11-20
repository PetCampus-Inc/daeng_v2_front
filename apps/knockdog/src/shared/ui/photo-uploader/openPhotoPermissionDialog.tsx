'use client';

import { overlay } from 'overlay-kit';

import { openConfirmDialog } from '@shared/lib/bridge';
import { openSystemSetting } from '@shared/lib/bridge/openSystemSetting';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

/** 사진 접근 권한이 없을 때 띄우는 확인창 문구. 앱 확인창과 웹 확인창이 같이 쓴다. */
const PHOTO_PERMISSION_DIALOG = {
  title: '사진 접근 권한이 필요해요',
  description: "사용 중인 기기에서 사진 접근 권한을\n'허용'으로 설정해 주세요.",
  cancelLabel: '나중에 하기',
  confirmLabel: '설정하기',
};

/** 권한 안내 확인창을 연다. 앱에서는 앱 확인창을 먼저 시도하고, 쓸 수 없으면 웹 확인창을 띄운다. */
async function openPhotoPermissionDialog() {
  const result = await openConfirmDialog(PHOTO_PERMISSION_DIALOG);
  if (result.status === 'pending') return;

  if (result.status === 'resolved') {
    if (result.action === 'confirm') openSystemSetting();
    return;
  }

  overlay.open(({ isOpen, close }) => (
    <ConfirmDialog
      {...PHOTO_PERMISSION_DIALOG}
      isOpen={isOpen}
      onClose={close}
      onConfirm={() => {
        close();
        openSystemSetting();
      }}
    />
  ));
}

export { openPhotoPermissionDialog };

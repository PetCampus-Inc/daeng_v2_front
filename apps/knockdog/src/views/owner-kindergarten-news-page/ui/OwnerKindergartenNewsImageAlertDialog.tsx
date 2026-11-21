'use client';

import { overlay } from 'overlay-kit';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { openConfirmDialog } from '@shared/lib/bridge';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

function openWebImageAlert(title: string, description: string) {
  overlay.open(({ isOpen, close }) => (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      description={description}
      confirmLabel={ownerKindergartenNewsContent.write.imageUpload.confirmLabel}
      onClose={close}
      onConfirm={close}
    />
  ));
}

/** 네이티브 confirm → 웹 확인창 폴백 */
function openOwnerKindergartenNewsImageAlert(title: string, description: string) {
  setTimeout(async () => {
    const result = await openConfirmDialog({
      title,
      description,
      confirmLabel: ownerKindergartenNewsContent.write.imageUpload.confirmLabel,
      showCancelButton: false,
    });

    if (result.status === 'unavailable') openWebImageAlert(title, description);
  }, 0);
}

export { openOwnerKindergartenNewsImageAlert };

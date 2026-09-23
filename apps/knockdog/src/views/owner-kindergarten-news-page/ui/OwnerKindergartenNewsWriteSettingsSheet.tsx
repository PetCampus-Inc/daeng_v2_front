'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { getActiveAnnouncementNews } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNewsStore';
import { OwnerKindergartenNewsAnnouncementReplaceDialog } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsAnnouncementReplaceDialog';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface OwnerKindergartenNewsWriteSettingsSheetProps {
  isOpen: boolean;
  close: () => void;
  isAnnouncement: boolean;
  notifyGuardiansOnUpload: boolean;
  onAnnouncementChange: (value: boolean) => void;
  onNotifyGuardiansChange: (value: boolean) => void;
}

/** 글쓰기 설정 — 공지 등록 / 업로드 알림 토글 */
function OwnerKindergartenNewsWriteSettingsSheet({
  isOpen,
  close,
  isAnnouncement: initialIsAnnouncement,
  notifyGuardiansOnUpload: initialNotifyGuardiansOnUpload,
  onAnnouncementChange,
  onNotifyGuardiansChange,
}: OwnerKindergartenNewsWriteSettingsSheetProps) {
  const { write } = ownerKindergartenNewsContent;
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnnouncement, setIsAnnouncement] = useState(initialIsAnnouncement);
  const [notifyGuardiansOnUpload, setNotifyGuardiansOnUpload] = useState(
    initialNotifyGuardiansOnUpload
  );

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  if (!shouldRender) return null;

  const enableAnnouncement = () => {
    setIsAnnouncement(true);
    onAnnouncementChange(true);
  };

  const handleAnnouncementChange = (value: boolean) => {
    if (!value) {
      setIsAnnouncement(false);
      onAnnouncementChange(false);
      return;
    }

    if (isAnnouncement) return;

    const activeAnnouncement = getActiveAnnouncementNews();
    if (!activeAnnouncement) {
      enableAnnouncement();
      return;
    }

    overlay.open(({ isOpen: isDialogOpen, close: closeDialog }) => (
      <OwnerKindergartenNewsAnnouncementReplaceDialog
        isOpen={isDialogOpen}
        close={closeDialog}
        onConfirm={enableAnnouncement}
      />
    ));
  };

  const handleNotifyGuardiansChange = (value: boolean) => {
    setNotifyGuardiansOnUpload(value);
    onNotifyGuardiansChange(value);
  };

  return (
    <BottomSheet.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <BottomSheet.Overlay className='z-overlay' style={{ zIndex: 'var(--z-index-overlay)' }} />
      <BottomSheet.Body
        className='z-modal pb-[max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px))]'
        style={{ zIndex: 'var(--z-index-modal)' }}
      >
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-center justify-between px-4!'>
          <BottomSheet.Title>{write.settingsSheetTitle}</BottomSheet.Title>
          <BottomSheet.CloseButton aria-label={write.settingsSheetCloseAriaLabel} />
        </BottomSheet.Header>
        <BottomSheet.Content className='px-4 py-5'>
          <div className='flex w-full items-center justify-between py-4'>
            <p className='body1-bold text-text-primary'>{write.settingsAnnouncementLabel}</p>
            <Switch
              aria-label={write.settingsAnnouncementLabel}
              pressed={isAnnouncement}
              onPressedChange={handleAnnouncementChange}
            />
          </div>

          <div className='flex w-full items-center justify-between gap-2 py-4'>
            <div className='flex min-w-0 flex-1 flex-col'>
              <p className='body1-bold text-text-primary'>{write.settingsNotifyLabel}</p>
              <p className='body2-regular text-text-secondary'>{write.settingsNotifyDescription}</p>
            </div>
            <Switch
              aria-label={write.settingsNotifyLabel}
              pressed={notifyGuardiansOnUpload}
              onPressedChange={handleNotifyGuardiansChange}
            />
          </div>
        </BottomSheet.Content>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerKindergartenNewsWriteSettingsSheet };

'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import {
  formatOwnerKindergartenNewsDogLabel,
  formatOwnerKindergartenNewsReadAt,
} from '@views/owner-kindergarten-news-page/lib/formatOwnerKindergartenNewsReadReaction';
import type { OwnerKindergartenNewsReader } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { toast } from '@shared/ui/toast';

interface OwnerKindergartenNewsReadReactionSheetProps {
  isOpen: boolean;
  close: () => void;
  readers: OwnerKindergartenNewsReader[];
  guardianTotalCount: number;
  readCount: number;
}

function compareGuardianName(a: string, b: string) {
  return a.localeCompare(b, 'ko');
}

/** 연결 해제 + 미열람은 제외. 연결 해제여도 열람 기록은 유지 */
function isVisibleReader(reader: OwnerKindergartenNewsReader) {
  if (reader.isConnected) return true;
  return reader.readAt != null;
}

function showNotifySuccessToast(guardianName: string) {
  const { readReactionSheet } = ownerKindergartenNewsContent;
  const prefix = `${guardianName} 보호자에게 `;

  toast({
    type: 'success',
    nativeTitle: readReactionSheet.notifySuccessToast.nativeTitle.replace('{name}', guardianName),
    titleParts: [
      { text: prefix },
      { text: '알림', accent: true },
      { text: '을 전송했어요' },
    ],
    title: (
      <>
        <span className='text-text-primary-inverse'>{prefix}</span>
        <span className='text-text-accent'>알림</span>
        <span className='text-text-primary-inverse'>을 전송했어요</span>
      </>
    ),
  });
}

function OwnerKindergartenNewsReadReactionSheet({
  isOpen,
  close,
  readers,
  guardianTotalCount,
  readCount,
}: OwnerKindergartenNewsReadReactionSheetProps) {
  const { readReactionSheet } = ownerKindergartenNewsContent;
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const visibleReaders = useMemo(() => {
    return readers
      .filter(isVisibleReader)
      .filter((reader) => (showUnreadOnly ? reader.readAt == null : true))
      .slice()
      .sort((a, b) => compareGuardianName(a.guardianName, b.guardianName));
  }, [readers, showUnreadOnly]);

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const handleNotifyClick = (guardianName: string) => {
    // API 연동 전 — 성공 토스트만
    showNotifySuccessToast(guardianName);
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal flex max-h-[calc(100dvh-80px)] flex-col'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-center justify-between px-4!'>
          <BottomSheet.Title>{readReactionSheet.title}</BottomSheet.Title>
          <BottomSheet.CloseButton aria-label={readReactionSheet.closeAriaLabel} />
        </BottomSheet.Header>

        <div className='border-line-200 shrink-0 border-b px-4 pb-2'>
          <div className='flex items-center justify-between'>
            <p className='body1-bold text-text-primary'>
              {guardianTotalCount}
              {readReactionSheet.summaryMiddle}{' '}
              <span className='text-text-accent'>{readCount}</span>
              {readReactionSheet.summarySuffix}
            </p>
            <button
              type='button'
              className='flex items-center gap-0.5 p-2'
              aria-pressed={showUnreadOnly}
              onClick={() => setShowUnreadOnly((current) => !current)}
            >
              <span
                className={`size-2.5 shrink-0 rounded-full ${
                  showUnreadOnly ? 'bg-fill-primary-500' : 'bg-fill-secondary-400'
                }`}
                aria-hidden
              />
              <span className='label-semibold text-text-primary'>{readReactionSheet.unreadOnlyLabel}</span>
            </button>
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-4'>
          {visibleReaders.map((reader) => {
            const dogLabel = formatOwnerKindergartenNewsDogLabel(reader.dogNames);
            const readAtLabel = reader.readAt
              ? formatOwnerKindergartenNewsReadAt(new Date(reader.readAt))
              : null;

            return (
              <div
                key={reader.id}
                className='border-line-200 flex items-center gap-4 border-b py-3'
              >
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  {readAtLabel ? (
                    <div className='flex items-center gap-1'>
                      <Icon icon='CheckFill' className='text-text-accent size-4 shrink-0' aria-hidden />
                      <span className='body2-semibold text-text-secondary'>{readAtLabel}</span>
                    </div>
                  ) : null}
                  <div className='flex min-w-0 items-center gap-2'>
                    <span className='body1-extrabold text-text-primary shrink-0 whitespace-nowrap'>
                      {reader.guardianName} 보호자
                    </span>
                    {dogLabel ? (
                      <span className='body2-regular text-text-secondary min-w-0 flex-1 truncate'>
                        {dogLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <button
                  type='button'
                  className='bg-fill-primary-500 radius-r2 body2-bold text-text-primary-inverse inline-flex shrink-0 items-center gap-1 px-4 py-3.5'
                  onClick={() => handleNotifyClick(reader.guardianName)}
                >
                  <Icon icon='AlarmLine' className='size-5' aria-hidden />
                  {readReactionSheet.notifyButtonLabel}
                </button>
              </div>
            );
          })}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

function openOwnerKindergartenNewsReadReactionSheet(params: {
  readers: OwnerKindergartenNewsReader[];
  guardianTotalCount: number;
  readCount: number;
}) {
  overlay.open(({ isOpen, close }) => (
    <OwnerKindergartenNewsReadReactionSheet
      isOpen={isOpen}
      close={close}
      readers={params.readers}
      guardianTotalCount={params.guardianTotalCount}
      readCount={params.readCount}
    />
  ));
}

export {
  OwnerKindergartenNewsReadReactionSheet,
  openOwnerKindergartenNewsReadReactionSheet,
};

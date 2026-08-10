'use client';

import React from 'react';
import { Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import type { GuardianAlbumKindergartenOption } from '@views/guardian-album-page/config/guardianAlbumKindergartenMock';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { toast } from '@shared/ui/toast';

interface GuardianAlbumKindergartenSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  kindergartens: GuardianAlbumKindergartenOption[];
  currentKindergartenId: string | null;
  onSelect: (kindergartenId: string) => void;
}

function formatAttendedUntilLabel(attendedUntil: string) {
  const [year, month, day] = attendedUntil.split('-');
  if (!year || !month || !day) return guardianAlbumContent.pastStatusLabel(attendedUntil);
  return guardianAlbumContent.pastStatusLabel(
    `${year}년 ${Number(month)}월 ${Number(day)}일`
  );
}

function GuardianAlbumKindergartenSelectSheet({
  isOpen,
  close,
  kindergartens,
  currentKindergartenId,
  onSelect,
}: GuardianAlbumKindergartenSelectSheetProps) {
  const content = guardianAlbumContent;

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelect = (kindergarten: GuardianAlbumKindergartenOption) => {
    if (kindergarten.id === currentKindergartenId) {
      close();
      return;
    }

    onSelect(kindergarten.id);
    close();

    toast({
      type: 'success',
      nativeTitle: `${content.toastAccentLabel}${content.toastSuffix}`,
      titleParts: [
        { text: content.toastAccentLabel, accent: true },
        { text: content.toastSuffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{content.toastAccentLabel}</span>
          <span className='body1-medium text-text-primary-inverse'>{content.toastSuffix}</span>
        </>
      ),
    });
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>{content.kindergartenSelectTitle}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='max-h-[60vh] overflow-y-auto py-5'>
          {kindergartens.map((kindergarten, index) => {
            const isSelected = currentKindergartenId === kindergarten.id;
            const attendedUntil = kindergarten.attendedUntil;
            const isAttending = attendedUntil == null;
            const imageSrc = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? ''}${kindergarten.imageUrl}`;
            const statusLabel = isAttending
              ? content.attendingStatusLabel
              : formatAttendedUntilLabel(attendedUntil);

            return (
              <React.Fragment key={kindergarten.id}>
                <button
                  type='button'
                  className='flex w-full items-center gap-2 px-4 py-4'
                  onClick={() => handleSelect(kindergarten)}
                >
                  <div className='relative size-11 shrink-0 overflow-hidden rounded-lg'>
                    {/* eslint-disable-next-line @next/next/no-img-element -- S3 배너 키는 img로 로드 */}
                    <img
                      src={imageSrc}
                      alt=''
                      className='size-full object-cover'
                      loading='lazy'
                      decoding='async'
                      referrerPolicy='no-referrer'
                    />
                    {isSelected ? (
                      <span className='absolute right-0 bottom-0 size-6'>
                        <span className='absolute inset-[3px] rounded-full bg-white' aria-hidden='true' />
                        <Icon icon='CheckFill' className='text-text-accent relative size-6' />
                      </span>
                    ) : null}
                  </div>

                  <div className='flex min-w-0 flex-1 flex-col items-start'>
                    <span
                      className={cn(
                        'body1-bold w-full truncate',
                        isSelected ? 'text-text-accent' : 'text-text-primary'
                      )}
                    >
                      {kindergarten.name}
                    </span>
                    <span
                      className={cn(
                        'w-full truncate',
                        isAttending
                          ? 'body2-semibold text-text-accent'
                          : 'body2-regular text-text-secondary'
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </button>
                {index < kindergartens.length - 1 ? (
                  <div className='px-4'>
                    <Divider />
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianAlbumKindergartenSelectSheet };

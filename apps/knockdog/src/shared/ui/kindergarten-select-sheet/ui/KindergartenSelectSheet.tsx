'use client';

import React from 'react';
import { Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { kindergartenSelectSheetContent } from '@shared/ui/kindergarten-select-sheet/config/kindergartenSelectSheetContent';
import type { KindergartenSelectOption } from '@shared/ui/kindergarten-select-sheet/model/types';
import { resolvePublicImageSrc } from '@shared/lib/utils/resolvePublicImageSrc';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { toast } from '@shared/ui/toast';

interface KindergartenSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  kindergartens: KindergartenSelectOption[];
  currentKindergartenId: string | null;
  onSelect: (kindergartenId: string) => void;
}

function formatAttendedUntilLabel(attendedUntil: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(attendedUntil);
  if (!match) return kindergartenSelectSheetContent.pastStatusLabel(attendedUntil);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const isValidCalendarDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  if (!isValidCalendarDate) {
    return kindergartenSelectSheetContent.pastStatusLabel(attendedUntil);
  }

  return kindergartenSelectSheetContent.pastStatusLabel(`${year}년 ${month}월 ${day}일`);
}

function KindergartenSelectSheet({
  isOpen,
  close,
  kindergartens,
  currentKindergartenId,
  onSelect,
}: KindergartenSelectSheetProps) {
  const content = kindergartenSelectSheetContent;

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelect = (kindergarten: KindergartenSelectOption) => {
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
        <BottomSheet.Header className='border-line-100 border-b items-start text-left'>
          <BottomSheet.Title className='w-full pr-10 text-left'>{content.title}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='max-h-[60vh] overflow-y-auto py-5'>
          {kindergartens.map((kindergarten, index) => {
            const isSelected = currentKindergartenId === kindergarten.id;
            const attendedUntil = kindergarten.attendedUntil;
            const isAttending = attendedUntil == null;
            const imageSrc = resolvePublicImageSrc(kindergarten.imageUrl);
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

                  <div className='flex min-w-0 flex-1 flex-col items-start text-left'>
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

export { KindergartenSelectSheet };
export type { KindergartenSelectSheetProps };

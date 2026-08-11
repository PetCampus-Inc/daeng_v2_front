'use client';

import React from 'react';
import { Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { guardianDogSelectContent } from '@views/guardian-kindergarten-page/config/guardianDogSelectContent';
import { getGuardianDogStatusBadge } from '@views/guardian-kindergarten-page/lib/getGuardianDogStatusBadge';
import { sortGuardianDogs } from '@views/guardian-kindergarten-page/lib/sortGuardianDogs';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

import type { Pet } from '@entities/pet';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { toast } from '@shared/ui/toast';

interface GuardianDogSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  dogs: Pet[];
  currentPetId: string | null;
  getPetConnectionStatus: (pet: Pet) => GuardianKindergartenConnectionStatus | null;
  onSelect: (petId: string) => void;
}

function GuardianDogSelectSheet({
  isOpen,
  close,
  dogs,
  currentPetId,
  getPetConnectionStatus,
  onSelect,
}: GuardianDogSelectSheetProps) {
  const sortedDogs = sortGuardianDogs(dogs, getPetConnectionStatus);

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleSelect = (dog: Pet) => {
    if (dog.id === currentPetId) {
      close();
      return;
    }

    onSelect(dog.id);
    close();

    const toastTitle = `${dog.name}${guardianDogSelectContent.toastSuffix}`;
    toast({
      type: 'success',
      nativeTitle: toastTitle,
      titleParts: [
        { text: dog.name, accent: true },
        { text: guardianDogSelectContent.toastSuffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{dog.name}</span>
          <span className='body1-medium text-text-primary-inverse'>{guardianDogSelectContent.toastSuffix}</span>
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
          <BottomSheet.Title>{guardianDogSelectContent.title}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='max-h-[60vh] overflow-y-auto px-4 py-5'>
          {sortedDogs.map((dog, index) => {
            const isSelected = currentPetId === dog.id;
            const badge = getGuardianDogStatusBadge(getPetConnectionStatus(dog));

            return (
              <React.Fragment key={dog.id}>
                <button
                  type='button'
                  className='flex w-full items-center gap-4 py-4'
                  onClick={() => handleSelect(dog)}
                >
                  <div className='relative size-11 shrink-0'>
                    <DogProfileAvatar
                      name={dog.name}
                      imageUrl={dog.profileImage}
                      className='border-line-100 size-11 border'
                    />
                    {isSelected ? (
                      <span className='absolute right-0 bottom-0 size-6'>
                        <span className='absolute inset-[3px] rounded-full bg-white' aria-hidden='true' />
                        <Icon icon='CheckFill' className='text-text-accent relative size-6' />
                      </span>
                    ) : dog.isRepresentative ? (
                      <Icon icon='Maindog' className='text-text-accent absolute right-0 bottom-0 size-6' />
                    ) : null}
                  </div>

                  <div className='gap-x2 flex min-w-0 flex-1 items-center'>
                    <span
                      className={cn(
                        'body1-bold truncate',
                        isSelected ? 'text-text-accent' : 'text-text-primary'
                      )}
                    >
                      {dog.name}
                    </span>
                    {badge ? (
                      <span className='border-line-accent caption1-semibold text-text-accent shrink-0 rounded-full border px-2 py-1'>
                        {badge}
                      </span>
                    ) : null}
                  </div>
                </button>
                {index < sortedDogs.length - 1 ? <Divider /> : null}
              </React.Fragment>
            );
          })}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianDogSelectSheet };

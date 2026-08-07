'use client';

import React, { useEffect, useState } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';
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
  getPetConnectionStatus: (pet: Pet) => GuardianKindergartenConnectionStatus;
  onConfirm: (petId: string) => void;
}

function GuardianDogSelectSheet({
  isOpen,
  close,
  dogs,
  currentPetId,
  getPetConnectionStatus,
  onConfirm,
}: GuardianDogSelectSheetProps) {
  const sortedDogs = sortGuardianDogs(dogs, getPetConnectionStatus);
  const [selectedDogId, setSelectedDogId] = useState(currentPetId);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDogId(
      currentPetId ?? dogs.find((dog) => dog.isRepresentative)?.id ?? dogs[0]?.id ?? null
    );
  }, [isOpen, currentPetId, dogs]);

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) close();
  };

  const handleConfirm = () => {
    if (!selectedDogId) {
      close();
      return;
    }

    const selectedDog = sortedDogs.find((dog) => dog.id === selectedDogId);
    if (!selectedDog) {
      close();
      return;
    }

    onConfirm(selectedDog.id);
    close();

    const toastTitle = `${selectedDog.name}${guardianDogSelectContent.toastSuffix}`;
    toast({
      type: 'success',
      nativeTitle: toastTitle,
      titleParts: [
        { text: selectedDog.name, accent: true },
        { text: guardianDogSelectContent.toastSuffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{selectedDog.name}</span>
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
        <BottomSheet.Header>
          <BottomSheet.Title>{guardianDogSelectContent.title}</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='px-4'>
          <div className='max-h-[60vh] overflow-y-auto py-5'>
            {sortedDogs.map((dog, index) => {
              const isSelected = selectedDogId === dog.id;
              const badge = getGuardianDogStatusBadge(getPetConnectionStatus(dog));

              return (
                <React.Fragment key={dog.id}>
                  <button
                    type='button'
                    className='flex w-full items-center gap-4 py-4'
                    onClick={() => setSelectedDogId(dog.id)}
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

          <div className='py-5'>
            <ActionButton variant='secondaryFill' onClick={handleConfirm}>
              {guardianDogSelectContent.confirmLabel}
            </ActionButton>
          </div>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { GuardianDogSelectSheet };

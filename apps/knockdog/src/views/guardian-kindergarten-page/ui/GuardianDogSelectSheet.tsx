'use client';

import React, { useCallback, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import {
  getGuardianSchoolHome,
  guardianHomeQueryKey,
  toGuardianHome,
} from '@entities/guardian-home';
import type { Pet } from '@entities/pet';
import { useUserStore } from '@entities/user';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';
import { toast } from '@shared/ui/toast';

import { guardianDogSelectContent } from '@views/guardian-kindergarten-page/config/guardianDogSelectContent';
import { getGuardianDogStatusBadge } from '@views/guardian-kindergarten-page/lib/getGuardianDogStatusBadge';
import { sortGuardianDogs } from '@views/guardian-kindergarten-page/lib/sortGuardianDogs';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

interface GuardianDogSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  dogs: Pet[];
  currentPetId: string | null;
  onSelect: (petId: string) => void;
}

function GuardianDogSelectSheet({
  isOpen,
  close,
  dogs,
  currentPetId,
  onSelect,
}: GuardianDogSelectSheetProps) {
  const userId = useUserStore((state) => state.user?.userId);

  const statusByPetId = useQueries({
    queries: dogs.map((pet) => ({
      queryKey: guardianHomeQueryKey(userId, pet.id),
      queryFn: () => getGuardianSchoolHome({ petId: pet.id }),
      select: (response: Awaited<ReturnType<typeof getGuardianSchoolHome>>) =>
        toGuardianHome(response.data).status,
      enabled: isOpen && Boolean(userId) && dogs.length > 0,
      staleTime: 0,
    })),
    combine: (results) => {
      const map = new Map<string, GuardianKindergartenConnectionStatus>();
      for (let index = 0; index < dogs.length; index += 1) {
        const pet = dogs[index];
        const status = results[index]?.data;
        if (pet && status) map.set(pet.id, status);
      }
      return map;
    },
  });

  const getPetConnectionStatus = useCallback(
    (pet: Pet): GuardianKindergartenConnectionStatus | null =>
      statusByPetId.get(pet.id) ?? null,
    [statusByPetId]
  );

  const sortedDogs = useMemo(
    () => sortGuardianDogs(dogs, getPetConnectionStatus),
    [dogs, getPetConnectionStatus]
  );

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
          <span className='body1-medium text-text-primary-inverse'>
            {guardianDogSelectContent.toastSuffix}
          </span>
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
                      pawClassName='text-fill-secondary-300'
                    />
                    {isSelected ? (
                      <span className='absolute right-0 bottom-0 size-6'>
                        <span className='absolute inset-[3px] rounded-full bg-white' aria-hidden='true' />
                        <Icon icon='CheckFill' className='text-text-accent relative size-6' />
                      </span>
                    ) : null}
                  </div>

                  <div className='gap-x2 flex min-w-0 flex-1 items-center'>
                    <span className='flex min-w-0 items-center gap-x-1.5'>
                      <span
                        className={cn(
                          'body1-bold truncate',
                          isSelected ? 'text-text-accent' : 'text-text-primary'
                        )}
                      >
                        {dog.name}
                      </span>
                      {dog.isRepresentative ? (
                        <Icon icon='Maindog' className='text-text-accent size-6 shrink-0' />
                      ) : null}
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

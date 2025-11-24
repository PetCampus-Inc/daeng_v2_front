'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Divider, ActionButton, Avatar, RadioGroup, RadioGroupItem, AvatarImage, AvatarFallback } from '@knockdog/ui';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import type { Dog } from './DogHouseSection';

interface DogSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  dogs: Dog[];
  onSelect?: (dogId: string) => void;
}

export const DogSelectSheet = ({ isOpen, close, dogs, onSelect }: DogSelectSheetProps) => {
  const [selectedDogId, setSelectedDogId] = useState<string>(
    dogs.find((dog) => dog.isRepresentative)?.id || dogs[0]?.id || ''
  );

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) {
      close();
    }
  };

  const handleConfirm = () => {
    if (selectedDogId) {
      onSelect?.(selectedDogId);
    }
    close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className=''>
          <BottomSheet.Title>대표 강아지를 선택해 주세요</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>
        <div className='px-4'>
          <div className='py-5'>
            <RadioGroup value={selectedDogId} onValueChange={setSelectedDogId}>
              {dogs.map((dog, index) => (
                <React.Fragment key={dog.id}>
                  <label className='flex items-center justify-between py-2' htmlFor={`dog-${dog.id}`}>
                    <div className='flex items-center gap-x-2'>
                      <Avatar>
                        <AvatarImage src={dog.imageUrl} />
                        <AvatarFallback className='border-line-200 rounded-full border p-0.5'>
                          <Image src='/images/img_default_image.png' alt={dog.name} width={40} height={40} />
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`body1-bold ${selectedDogId === dog.id ? 'text-text-accent' : 'text-text-primary'}`}
                      >
                        {dog.name}
                      </span>
                    </div>
                    <RadioGroupItem value={dog.id} id={`dog-${dog.id}`} />
                  </label>
                  {index < dogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </RadioGroup>
          </div>

          <div className='px-4 py-5'>
            <ActionButton variant='secondaryFill' onClick={handleConfirm}>
              확인
            </ActionButton>
          </div>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

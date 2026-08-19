'use client';

import { Divider, Avatar, AvatarImage, AvatarFallback, Icon } from '@knockdog/ui';
import { usePetUpdateRepresentativeMutation, type Pet } from '@entities/pet';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { toast } from '@shared/ui/toast';
import { pickRoEuro } from '../lib/josa';

interface DogSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  dogs: Pet[];
}

export const DogSelectSheet = ({ isOpen, close, dogs }: DogSelectSheetProps) => {
  const { mutateAsync: updatePetRepresentative } = usePetUpdateRepresentativeMutation();

  const handleClose = (open?: boolean) => {
    if (open === false || open === undefined) {
      close();
    }
  };

  const handleSelect = async (dog: Pet) => {
    if (dog.isRepresentative) {
      close();
      return;
    }

    try {
      await updatePetRepresentative(Number(dog.id));

      const josa = pickRoEuro(dog.name);
      toast({
        type: 'success',
        shape: 'rounded',
        nativeTitle: `${dog.name}${josa} 변경되었습니다`,
        titleParts: [
          { text: dog.name, accent: true },
          { text: `${josa} 변경되었습니다` },
        ],
        title: (
          <>
            <span className='text-text-accent'>{dog.name}</span>
            {`${josa} 변경되었습니다`}
          </>
        ),
      });

      close();
    } catch (error) {
      console.error('대표 강아지 지정 실패:', error);
      toast({
        title: '일시적 오류로 요청을 완료하지 못했어요',
        nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
      });
    }
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>대표 강아지를 선택해 주세요</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='py-5'>
          {dogs.map((dog, index) => (
            <div key={dog.id}>
              <button type='button' className='flex w-full items-center gap-4 p-4' onClick={() => handleSelect(dog)}>
                <span className='relative size-11 shrink-0'>
                  <Avatar className='size-11'>
                    <AvatarImage src={dog.profileImage} />
                    <AvatarFallback className='border-line-200 rounded-full border p-0.5'>
                      <Icon icon='Paw' className='text-fill-secondary-400 h-6 w-6' />
                    </AvatarFallback>
                  </Avatar>
                  {dog.isRepresentative && (
                    <Icon icon='Maindog' className='text-text-accent absolute right-0 bottom-0 size-6' />
                  )}
                </span>
                <span className='body1-bold text-text-primary flex-1 text-left'>{dog.name}</span>
              </button>

              {index < dogs.length - 1 && <Divider className='border-line-100 mx-4' />}
            </div>
          ))}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

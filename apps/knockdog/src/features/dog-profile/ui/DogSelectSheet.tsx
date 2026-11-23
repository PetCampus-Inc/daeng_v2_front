'use client';

import { useEffect, useState } from 'react';
import { Divider, Avatar, AvatarImage, AvatarFallback, Icon } from '@knockdog/ui';
import { getDogNameSuffix } from '@knockdog/ui/lib';
import { usePetUpdateRepresentativeMutation, type Pet } from '@entities/pet';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useNativeBackToClose } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

interface DogSelectSheetProps {
  isOpen: boolean;
  close: () => void;
  dogs: Pet[];
}

export const DogSelectSheet = ({ isOpen, close, dogs }: DogSelectSheetProps) => {
  const { mutateAsync: updatePetRepresentative } = usePetUpdateRepresentativeMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  // 다른 탭으로 전환 시 시트를 닫고, 복귀 시 다시 열리지 않게 함
  useEffect(() => {
    const handleNativeTabBlur = () => {
      setShouldRender(false);
      close();
    };

    window.addEventListener('knockdog:native-tab-will-blur', handleNativeTabBlur);
    window.addEventListener('knockdog:native-tab-blur', handleNativeTabBlur);

    return () => {
      window.removeEventListener('knockdog:native-tab-will-blur', handleNativeTabBlur);
      window.removeEventListener('knockdog:native-tab-blur', handleNativeTabBlur);
    };
  }, [close]);

  useNativeBackToClose(isOpen, close);

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
    // 연속 탭으로 여러 강아지에 대한 변경 요청이 동시에 나가는 것을 막는다.
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updatePetRepresentative(Number(dog.id));

      const particle = getDogNameSuffix(dog.name, '로');
      toast({
        type: 'success',
        shape: 'rounded',
        nativeTitle: `${dog.name}${particle} 변경되었습니다`,
        titleParts: [
          { text: dog.name, bold: true },
          { text: `${particle} 변경되었습니다` },
        ],
        title: (
          <>
            <span className='body1-bold text-text-primary-inverse'>{dog.name}</span>
            {`${particle} 변경되었습니다`}
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
    } finally {
      setIsUpdating(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleClose}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>대표 강아지를 선택해 주세요</BottomSheet.Title>
          <BottomSheet.CloseButton onClick={close} />
        </BottomSheet.Header>

        <div className='pt-5 pb-[max(1.25rem,var(--safe-area-inset-bottom,0px))]'>
          {dogs.map((dog, index) => (
            <div key={dog.id}>
              <button
                type='button'
                className='flex w-full items-center gap-4 p-4 disabled:opacity-50'
                disabled={isUpdating}
                onClick={() => handleSelect(dog)}
              >
                <span className='relative size-11 shrink-0'>
                  <Avatar className='size-11'>
                    <AvatarImage src={dog.profileImage} className='object-cover' />
                    <AvatarFallback className='border-line-200 rounded-full border p-0.5'>
                      <Icon icon='Paw' className='text-fill-secondary-400 h-6 w-6' />
                    </AvatarFallback>
                  </Avatar>
                </span>
                <span className='body1-bold text-text-primary flex min-w-0 flex-1 items-center gap-x-1.5 text-left'>
                  <span className='truncate'>{dog.name}</span>
                  {dog.isRepresentative ? (
                    <Icon icon='Maindog' className='text-text-accent size-6 shrink-0' />
                  ) : null}
                </span>
              </button>

              {index < dogs.length - 1 && <Divider className='border-line-100 mx-4' />}
            </div>
          ))}
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

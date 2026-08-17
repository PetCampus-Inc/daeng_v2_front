import { ActionButton, Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { Pet } from '@entities/pet';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface PetNameDuplicateSheetProps {
  pets: Pet[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGoToPetList: () => void;
  onSaveAsIs: () => void;
  onViewPetProfile: (petId: string) => void;
}

function PetNameDuplicateSheet({
  pets,
  isOpen,
  onOpenChange,
  onGoToPetList,
  onSaveAsIs,
  onViewPetProfile,
}: PetNameDuplicateSheetProps) {
  const handleViewPetProfile = (petId: string) => {
    onOpenChange(false);
    onViewPetProfile(petId);
  };

  const handleGoToPetList = () => {
    onOpenChange(false);
    onGoToPetList();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal flex h-[616px] max-h-[calc(100dvh-64px)] min-h-0 flex-col'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='items-center justify-between px-4 py-3'>
          <BottomSheet.Title>같은 이름의 강아지가 있어요</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>

        <BottomSheet.Content padded={false} className='min-h-0 flex-1 overflow-y-auto p-4'>
          <ul className='flex flex-col gap-3' aria-label='같은 이름의 강아지 목록'>
            {pets.map((pet) => (
              <li key={pet.id} className='border-line-200 flex h-[84px] items-center gap-2 rounded-xl border p-4'>
                <Avatar className='size-[52px] border-line-100 bg-fill-secondary-50 border-2'>
                  {pet.profileImage ? <AvatarImage src={pet.profileImage} alt={`${pet.name} 프로필 이미지`} className='object-cover' /> : null}
                  <AvatarFallback className='bg-fill-secondary-50'>
                    <Icon icon='Paw' className='size-6 text-primitive-neutral-300' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-1 flex-col justify-center'>
                  <div className='flex items-center gap-0.5'>
                    <span className='h3-extrabold text-text-accent truncate'>{pet.name}</span>
                    {pet.gender === 'MALE' || pet.gender === 'FEMALE' ? (
                      <Icon
                        icon={pet.gender === 'MALE' ? 'Male' : 'Female'}
                        className='size-4 shrink-0 text-text-primary'
                      />
                    ) : null}
                  </div>
                  <span className='label-medium text-text-primary truncate'>{pet.breed}</span>
                </div>
                <button
                  type='button'
                  onClick={() => handleViewPetProfile(pet.id)}
                  className='caption2-semibold radius-r2 h-[30px] shrink-0 bg-fill-secondary-100 px-3 text-text-secondary'
                >
                  프로필 보기
                </button>
              </li>
            ))}
          </ul>
        </BottomSheet.Content>

        <BottomSheet.Footer className='flex flex-row gap-2 bg-bg-0 p-4 pb-5'>
          <ActionButton type='button' variant='secondaryLine' size='large' className='flex-1' onClick={handleGoToPetList}>
            목록으로 이동
          </ActionButton>
          <ActionButton type='button' size='large' className='flex-1' onClick={onSaveAsIs}>
            이대로 저장
          </ActionButton>
        </BottomSheet.Footer>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { PetNameDuplicateSheet };

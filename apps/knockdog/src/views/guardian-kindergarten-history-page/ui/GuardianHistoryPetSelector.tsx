'use client';

import { SelectDogCard } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

import { formatAge, type Pet } from '@entities/pet';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';

interface GuardianHistoryPetSelectorProps {
  pets: Pet[];
  selectedPet: Pet;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (petId: string) => void;
}

const toWeightLabel = (weight: number) => (weight > 0 ? `${weight}kg` : '');

const PetAvatar = ({ pet }: { pet: Pet }) => (
  <DogProfileAvatar
    name={pet.name}
    imageUrl={pet.profileImage}
    className='size-full border-0'
    pawClassName='text-fill-secondary-400'
  />
);

/** 연결 이력 위쪽 강아지 선택. 예약 탭과 같은 카드 시트 */
const GuardianHistoryPetSelector = ({
  pets,
  selectedPet,
  isOpen,
  onOpenChange,
  onSelect,
}: GuardianHistoryPetSelectorProps) => {
  const { petSelector } = guardianConnectionHistoryContent;
  const canSelect = pets.length > 1;
  const isListOpen = isOpen && canSelect;
  const otherPets = pets.filter((pet) => pet.id !== selectedPet.id);

  const handleCardClick = () => {
    if (!canSelect) return;
    onOpenChange(!isOpen);
  };

  const handlePetSelect = (petId: string) => {
    onSelect(petId);
    onOpenChange(false);
  };

  return (
    <div className='relative z-20'>
      <div
        className={cn(
          'overflow-hidden',
          isListOpen ? 'bg-bg-0' : 'bg-bg-0 rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]'
        )}
      >
        <SelectDogCard
          isExpanded={isListOpen}
          showIcon={false}
          name={selectedPet.name}
          breed={selectedPet.breed}
          age={formatAge(selectedPet.birthYear)}
          weight={toWeightLabel(selectedPet.weight)}
          className='rounded-none shadow-none'
          onClick={handleCardClick}
        >
          <PetAvatar pet={selectedPet} />
        </SelectDogCard>
      </div>
      {isListOpen ? (
        <div
          role='region'
          aria-label={petSelector.listLabel}
          className='bg-bg-0 absolute inset-x-0 top-full z-20 overflow-hidden rounded-b-[24px] shadow-[0_11px_24px_rgba(235,213,189,0.1)]'
        >
          <div className='bg-bg-0 flex flex-col'>
            {otherPets.map((pet) => (
              <SelectDogCard
                key={pet.id}
                showIcon={false}
                name={pet.name}
                breed={pet.breed}
                age={formatAge(pet.birthYear)}
                weight={toWeightLabel(pet.weight)}
                onClick={() => handlePetSelect(pet.id)}
              >
                <PetAvatar pet={pet} />
              </SelectDogCard>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { GuardianHistoryPetSelector };

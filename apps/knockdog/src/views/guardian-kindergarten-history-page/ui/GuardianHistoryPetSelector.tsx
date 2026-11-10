'use client';

import { useState } from 'react';
import { SelectDogCard, SelectDogPanel } from '@knockdog/ui';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

import { formatAge, type Pet } from '@entities/pet';
import { DogProfileAvatar } from '@shared/ui/dog-profile-avatar';

interface GuardianHistoryPetSelectorProps {
  pets: Pet[];
  selectedPet: Pet;
  onSelect: (petId: string) => void;
}

const toWeightLabel = (weight: number) => (weight > 0 ? `${weight}kg` : '');

/** 연결 이력 화면 위쪽의 강아지 선택 카드와 드롭다운 목록 */
const GuardianHistoryPetSelector = ({ pets, selectedPet, onSelect }: GuardianHistoryPetSelectorProps) => {
  const { petSelector } = guardianConnectionHistoryContent;
  const [isOpen, setIsOpen] = useState(false);
  const canSelect = pets.length > 1;

  const handleCardClick = () => {
    if (!canSelect) return;
    setIsOpen((prev) => !prev);
  };

  const handlePetSelect = (index: number) => {
    const pet = pets[index];
    if (!pet) return;
    onSelect(pet.id);
    setIsOpen(false);
  };

  return (
    <div className='relative z-20'>
      {isOpen ? (
        <button
          type='button'
          aria-label={petSelector.closeLabel}
          className='bg-dim-70 fixed inset-0 z-0'
          onClick={() => setIsOpen(false)}
        />
      ) : null}
      {isOpen ? (
        <div role='region' aria-label={petSelector.listLabel} className='absolute inset-x-0 top-0 z-10'>
          <SelectDogPanel
            dogs={pets.map((pet) => ({
              name: pet.name,
              breed: pet.breed,
              age: formatAge(pet.birthYear),
              weight: toWeightLabel(pet.weight),
              image: <DogProfileAvatar name={pet.name} imageUrl={pet.profileImage} className='size-full border-0' />,
            }))}
            onSelect={(_, index) => handlePetSelect(index)}
          />
        </div>
      ) : null}
      <div className='relative z-20'>
        <SelectDogCard
          variant={isOpen ? 'open' : 'closed'}
          showIcon={canSelect}
          name={selectedPet.name}
          breed={selectedPet.breed}
          age={formatAge(selectedPet.birthYear)}
          weight={toWeightLabel(selectedPet.weight)}
          onClick={handleCardClick}
        >
          <DogProfileAvatar name={selectedPet.name} imageUrl={selectedPet.profileImage} className='size-full border-0' />
        </SelectDogCard>
      </div>
    </div>
  );
};

export { GuardianHistoryPetSelector };

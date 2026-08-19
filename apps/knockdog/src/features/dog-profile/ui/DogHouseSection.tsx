import { DogHouseHeader } from './DogHouseHeader';
import { DogCard } from './DogCard';
import { AddDogCard } from './AddDogCard';
import type { Pet } from '@entities/pet';
import { calculateAge } from '@entities/pet';
interface DogHouseSectionProps {
  dogs: Pet[];
  maxDogs?: number;
  withBottomPadding?: boolean;
  onChangeRepresentative: () => void;
  onDogClick: (dogId: string) => void;
  onAddDog: () => void;
}

function DogHouseSection({
  dogs,
  maxDogs = 5,
  withBottomPadding = true,
  onChangeRepresentative,
  onDogClick,
  onAddDog,
}: DogHouseSectionProps) {
  return (
    <div className={withBottomPadding ? 'py-5' : 'pt-5'}>
      <DogHouseHeader
        currentCount={dogs.length}
        maxCount={maxDogs}
        onChangeRepresentative={onChangeRepresentative}
      />

      <div className='scrollbar-hide flex gap-x-2 overflow-x-auto px-4'>
        {dogs.map((dog) => (
          <DogCard
            key={dog.id}
            name={dog.name}
            breed={dog.breed}
            age={dog.birthYear ? calculateAge(dog.birthYear) : undefined}
            imageUrl={dog.profileImage}
            isRepresentative={dog.isRepresentative}
            onClick={() => onDogClick(dog.id)}
          />
        ))}

        {dogs.length < maxDogs && <AddDogCard dogNumber={dogs.length + 1} onClick={onAddDog} />}
      </div>
    </div>
  );
}

export { DogHouseSection };

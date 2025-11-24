import { DogHouseHeader } from './DogHouseHeader';
import { DogCard } from './DogCard';
import { AddDogCard } from './AddDogCard';

interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  imageUrl?: string;
  isRepresentative: boolean;
}

interface DogHouseSectionProps {
  dogs: Dog[];
  maxDogs?: number;
  onChangeRepresentative: () => void;
  onDogClick: (dogId: string) => void;
  onAddDog: () => void;
}

function DogHouseSection({ dogs, maxDogs = 5, onChangeRepresentative, onDogClick, onAddDog }: DogHouseSectionProps) {
  const representativeDog = dogs.find((dog) => dog.isRepresentative);

  return (
    <>
      <DogHouseHeader
        representativeDogName={representativeDog?.name || ''}
        currentCount={dogs.length}
        maxCount={maxDogs}
        onChangeRepresentative={onChangeRepresentative}
      />

      <div className='scrollbar-hide mb-[48px] flex gap-x-2 overflow-x-auto px-4'>
        {dogs.map((dog) => (
          <DogCard
            key={dog.id}
            name={dog.name}
            breed={dog.breed}
            age={dog.age}
            imageUrl={dog.imageUrl}
            isRepresentative={dog.isRepresentative}
            onClick={() => onDogClick(dog.id)}
          />
        ))}

        {dogs.length < maxDogs && <AddDogCard dogNumber={dogs.length + 1} onClick={onAddDog} />}
      </div>
    </>
  );
}

export { DogHouseSection };
export type { Dog };

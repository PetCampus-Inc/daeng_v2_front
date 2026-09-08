import { useRef } from 'react';
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
  const dragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; hasDragged: boolean } | null>(
    null
  );
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      hasDragged: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const distance = event.clientX - dragState.startX;
    if (Math.abs(distance) > 4) {
      dragState.hasDragged = true;
      event.preventDefault();
    }

    event.currentTarget.scrollLeft = dragState.startScrollLeft - distance;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current = null;
    if (!dragState.hasDragged) return;

    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  return (
    <div className={withBottomPadding ? 'py-5' : 'pt-5'}>
      <DogHouseHeader
        currentCount={dogs.length}
        maxCount={maxDogs}
        onChangeRepresentative={onChangeRepresentative}
      />

      <div
        className='scrollbar-hide flex cursor-grab gap-x-2 overflow-x-auto px-4 select-none active:cursor-grabbing'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;

          event.preventDefault();
          event.stopPropagation();
        }}
      >
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

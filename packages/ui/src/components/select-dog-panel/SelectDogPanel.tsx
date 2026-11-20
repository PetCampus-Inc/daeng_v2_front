import { type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

import { SelectDogCard } from '../select-dog-card';

interface SelectDogItem {
  name: string;
  breed: string;
  age: string;
  weight: string;
  image?: ReactNode;
}

interface SelectDogPanelProps {
  dogs?: SelectDogItem[];
  className?: string;
  onSelect?: (dog: SelectDogItem, index: number) => void;
}

const DEFAULT_DOGS: SelectDogItem[] = [
  { name: '구름이', breed: '말티즈', age: '2살', weight: '3kg' },
  { name: '두부', breed: '포메라니안', age: '7살', weight: '3kg' },
  { name: '두부', breed: '포메라니안', age: '7살', weight: '3kg' },
  { name: '두부', breed: '포메라니안', age: '7살', weight: '3kg' },
];

/** V4 / Select Dog / Dropdown Panel */
function SelectDogPanel({ dogs = DEFAULT_DOGS, className, onSelect }: SelectDogPanelProps) {
  return (
    <div
      className={cn(
        'bg-bg-0 px-x3 pb-x4 flex w-full flex-col gap-x1 overflow-hidden rounded-b-[24px] pt-[60px] shadow-[0_12px_24px_rgba(0,0,0,0.08)]',
        className
      )}
    >
      {dogs.map((dog, index) => (
        <SelectDogCard
          key={`${dog.name}-${index}`}
          variant='list'
          name={dog.name}
          breed={dog.breed}
          age={dog.age}
          weight={dog.weight}
          onClick={() => onSelect?.(dog, index)}
        >
          {dog.image}
        </SelectDogCard>
      ))}
    </div>
  );
}

export { SelectDogPanel };
export type { SelectDogItem, SelectDogPanelProps };

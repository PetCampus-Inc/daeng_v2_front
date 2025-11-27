import { Icon } from '@knockdog/ui';
import Image from 'next/image';
import { cn } from '@knockdog/ui/lib';

interface DogCardProps {
  name: string;
  breed: string;
  age: number;
  imageUrl?: string;
  isRepresentative?: boolean;
  onClick?: () => void;
}

function DogCard({ name, breed, age, imageUrl, isRepresentative, onClick }: DogCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative h-[200px] w-[150px] shrink-0 overflow-hidden rounded-2xl',
        !imageUrl && 'bg-fill-secondary-50 border-line-200 border'
      )}
    >
      {imageUrl && <Image src={imageUrl} alt={name} fill className='object-cover' />}

      {isRepresentative && (
        <div className='bg-fill-primary-500 caption1-regular text-text-primary-inverse absolute top-4 left-4 rounded-full px-2 py-0.5'>
          대표
        </div>
      )}
      <div className='absolute bottom-4 left-4 flex flex-col gap-y-1'>
        <div className='h3-semibold flex items-center gap-x-0.5'>
          <Icon icon='Smalldog' />
          <span className='text-text-primary-inverse'>{name}</span>
        </div>
        <div className='body2-regular text-text-primary-inverse'>
          {breed} • {age}살
        </div>
      </div>
    </div>
  );
}

export { DogCard };

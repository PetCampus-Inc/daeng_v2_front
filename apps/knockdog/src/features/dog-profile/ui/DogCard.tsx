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

      <div className='absolute bottom-4 left-4 flex flex-col gap-y-1'>
        <div className='h3-semibold flex items-center gap-x-0.5'>
          {isRepresentative && <Icon icon='Maindog' className='text-text-accent size-5' />}
          <span className='text-text-primary-inverse'>{name}</span>
        </div>
        <div className='body2-regular text-text-primary-inverse flex max-w-[118px] items-center gap-x-1'>
          <span className='truncate'>{breed}</span>
          <span className='shrink-0'>• {age}살</span>
        </div>
      </div>
    </div>
  );
}

export { DogCard };
